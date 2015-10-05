'use strict';

let Promise = require('bluebird')
  , oauth2orize = require('oauth2orize')
  , config = require('../config')
  , redis = require('redis')
  , bcrypt = Promise.promisifyAll(require('bcryptjs'))
  , sha1 = require('sha1')
  , randtoken = require('rand-token')
  , XDate = require('xdate')
  , usersRepository = require('../users/repository');

let server = oauth2orize.createServer()
  , redisClient = Promise.promisifyAll(redis.createClient({
      host: config.redis.host,
      port: config.redis.port
    }));

// password to token exchange handler
let passwordHandler = Promise.coroutine(function *(client, email, password, scope, done) {
  try {
    let user = yield usersRepository.findByEmail(email);

    if (user && (yield bcrypt.compareAsync(password, user.hashedPassword))) {
      let tokens = yield generateToken(client, user);
      return done(null, tokens.token, tokens.refreshToken, {
        expires_in: config.auth.bearerTTL
      });
    }

    return done(null, false);
  } catch (err) {
    return done(err);
  }
});

// since Promise.coroutine result has length 0, wrap exchangeHandler
// with a 5-arg fn so oauth2orize does not omit scope
server.exchange(oauth2orize.exchange.password((client, email, password, scope, done) =>
  passwordHandler(client, email, password, scope, done)
));

// refresh token to token exchange handler
let refreshHandler = Promise.coroutine(function *(client, refreshToken, scope, done) {
  try {
    let oldRefreshKey = 'r/' + sha1(refreshToken)
      , tokenProps = yield redisClient.hgetallAsync(oldRefreshKey);

    if (!tokenProps || tokenProps.expiresAt < (new XDate()).getTime()) {
      return done(null, false);
    }

    let user = yield usersRepository.findByEmail(tokenProps.email);
    if (!user) { return done(null, false); }

    // generate new tokens and revoke current refresh token
    let tokens = yield generateToken(client, user)
      , refreshTokensList = yield redisClient.lrangeAsync(`rl/${client}/${user.email}`, 0, -1);

    if (refreshTokensList && refreshTokensList.length > 0) {
      // keep the latest 20 tokens, and delete the rest so long-lived refreshed tokens
      // don't build up in memory
      let tokensToDelete = refreshTokensList.slice(20)
        , promises = [
          // only keep the latest 20 tokens in list
          redisClient.ltrimAsync(`rl/${client}/${user.email}`, 0, 19),
          // add the used token to be deleted next time a new bearer token is used
          redisClient.saddAsync(`rd/${client}/${user.email}`, oldRefreshKey)
        ];

      (tokensToDelete.length > 0) && promises.push(
        // delete rest of the tokens
        redisClient.delAsync(tokensToDelete)
      );

      yield Promise.all(promises);
    }

    return done(null, tokens.token, tokens.refreshToken, {
      expires_in: config.auth.bearerTTL
    });
  } catch (err) {
    return done(err);
  }
});

server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) =>
  refreshHandler(client, refreshToken, scope, done)
));

/**
 * Given a client and user, generates and persists bearer and refresh tokens
 *
 * @param client {string} a client ID
 * @param user {User} the user to generate token for
 * @return {Promise.<Object>} key-value pair containing token and refreshToken
 */
let generateToken = Promise.coroutine(function *(client, user) {
  // generate tokens
  let token = randtoken.generate(16)
    , tokenKey = 'b/' + sha1(token)
    , tokenExpiry = (new XDate()).addSeconds(config.auth.bearerTTL).getTime()
    , refreshToken = randtoken.generate(16)
    , refreshKey = 'r/' + sha1(refreshToken)
    , refreshExpiry = (new XDate()).addSeconds(config.auth.refreshTTL).getTime();

  // save tokens
  yield Promise.all([
    redisClient.hmsetAsync(tokenKey, {
      client,
      email: user.email,
      user: JSON.stringify(user),
      privileges: user.groups.join(' '),
      expiresAt: tokenExpiry,
      new: 1
    }),
    redisClient.hmsetAsync(refreshKey, {
      client,
      email: user.email,
      privileges: user.groups.join(' '),
      expiresAt: refreshExpiry
    }),
    // keep track of all refresh tokens for a client/user pair;
    // this list is always a superset of actually available refresh tokens
    redisClient.lpushAsync(`rl/${client}/${user.email}`, refreshKey)
  ]);

  // set expiry times for redis cleanup
  yield Promise.all([
    redisClient.expireatAsync(tokenKey, config.auth.bearerTTL),
    redisClient.expireatAsync(refreshKey, config.auth.refreshTTL)
  ]);

  return { token, refreshToken };
});

/**
 * Validates a bearer token, resolving a cached user if valid, otherwise
 * resolving false
 *
 * @param token {string} a bearer token
 * @return {Promise.<User>} the user associated with the token
 */
let validateBearerToken = Promise.coroutine(function *(token) {
  let tokenProps = yield redisClient.hgetallAsync('b/' + sha1(token));

  if (!tokenProps || tokenProps.expiresAt < (new XDate()).getTime()) {
    return false;
  }
  // if the bearer token is newly created (i.e. has not been used yet),
  // perform refresh token cleanup procedure and set new flag to 0
  if (tokenProps.new) {
    let keysToDel = yield redisClient.smembersAsync(
      `rd/${tokenProps.client}/${tokenProps.email}`
    );

    let promises = [
      // set token 'new' flag to 0
      redisClient.hsetAsync('b/' + sha1(token), 'new', '0')
    ];

    (keysToDel && keysToDel.length > 0) && promises.concat([
      // delete all refresh tokens marked for deletion
      redisClient.delAsync(keysToDel),
      // delete the list itself
      redisClient.delAsync(`rd/${tokenProps.client}/${tokenProps.email}`)
    ]);

    yield Promise.all(promises);
  }

  return JSON.parse(tokenProps.user);
});

module.exports = {
  validateBearerToken,
  tokenExchange: [
    server.token(),
    server.errorHandler()
  ]
};
