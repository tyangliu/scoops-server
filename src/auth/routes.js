'use strict';

let restify = require('restify')
  , passport = require('passport')
  , provider = require('./provider')
  , clientsHandlers = require('./clients/handlers');

module.exports = function(server) {
  server.post({
    path: '/token',
    version: '1.0.0'
  },
    restify.bodyParser(),
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
