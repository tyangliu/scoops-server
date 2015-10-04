'use strict';

let Promise = require('bluebird')
  , oauth2orize = require('oauth2orize')
  , config = require('../config').redis
  , redis = require('redis')
  , bcrypt = Promise.promisifyAll(require('bcryptjs'))
  , randtoken = require('rand-token')
  , XDate = require('xdate')
  , usersRepository = require('../users/repository');

let server = oauth2orize.createServer()
  , redisClient = Promise.promisifyAll(redis.createClient({
      host: config.host,
      port: config.port
    }));

let exchangeHandler = Promise.coroutine(function *(client, email, password, scope, done) {
  let user = yield usersRepository.findByEmail(email)

  if (user && (yield bcrypt.compareAsync(password, user.hashedPassword))) {
    // generate tokens
    let token = randtoken.generate(16)
      , tokenExpiry = (new XDate()).addHours(2).getTime()
      , refreshToken = randtoken.generate(16)
      , refreshExpiry = (new XDate()).addWeeks(2).getTime();

    // save tokens
    yield Promise.all([
      redisClient.hmsetAsync('b/' + token, {
        email,
        privileges: user.groups.join(' '),
        expiresAt: tokenExpiry
      }),
      redisClient.hmsetAsync('r/' + refreshToken, {
        email,
        privileges: user.groups.join(' '),
        expiresAt: refreshExpiry
      })
    ]);

    // set expiry dates for redis cleanup
    yield Promise.all([
      redisClient.expireatAsync('b/' + token, tokenExpiry),
      redisClient.expireatAsync('r/' + refreshToken, refreshExpiry)
    ]);

    return done(null, token, refreshToken, { expires_in: 7200 });
  }

  return done(null, false);
});

// since Promise.coroutine result has length 0, wrap exchangeHandler
// with a 5-arg fn so oauth2orize does not omit scope
server.exchange(oauth2orize.exchange.password((client, email, password, scope, done) =>
  exchangeHandler(client, email, password, scope, done)
));


module.exports = [
  server.token(),
  server.errorHandler()
];
