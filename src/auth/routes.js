'use strict';

let Promise = require('bluebird')
  , Joi = require('Joi')
  , JoiPatterns = require('../utils/JoiPatterns')
  , passport = require('passport')
  , provider = require('./provider')
  , clientsHandlers = require('./clients/handlers');

function authRoutes(server) {
  server.post({
    path: '/token',
    version: '1.0.0'
  },
    passport.authenticate('oauth2-client-password', { session: false }),
    provider.tokenExchange
  );

  server.post({
    path: '/clients',
    version: '1.0.0'
  },
    passport.authenticate('bearer', { session: false }),
    clientsHandlers.postClients
  );
}

module.exports = authRoutes;
