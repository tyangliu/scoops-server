'use strict';

let cassandra = require('cassandra-driver')
  , AuthProvider = cassandra.auth.PlainTextAuthProvider
  , config = require('../config').db
  , client;

function getClient() {
  client = client || new cassandra.Client({
    contactPoints: [config.host],
    authProvider: new AuthProvider(config.username, config.password)
  });
  return client;
}

module.exports = getClient;
