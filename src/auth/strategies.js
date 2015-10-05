'use strict';

let Promise = require('bluebird')
  , passport = require('passport')
  , ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
  , BearerStrategy = require('passport-http-bearer').Strategy
  , provider = require('./provider');

passport.use(new ClientPasswordStrategy(
  Promise.coroutine(function *(clientId, clientSecret, done) {
    return done(null, 'potato');
  })
));

passport.use(new BearerStrategy(
  Promise.coroutine(function *(token, done) {
    try {
      let result = yield provider.validateBearerToken(token);
      return done(null, result);
    } catch (err) {
      return done(err);
    }
  })
));
