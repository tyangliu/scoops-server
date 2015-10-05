'use strict';

let Promise = require('bluebird')
  , Joi = require('Joi')
  , JoiPatterns = require('../utils/JoiPatterns')
  , passport = require('passport')
  , provider = require('./provider');

function authRoutes(server) {
  server.post({
    path: '/token',
    version: '1.0.0'
  },
    passport.authenticate('oauth2-client-password', { session: false }),
    provider.tokenExchange
  );
}

module.exports = authRoutes;
