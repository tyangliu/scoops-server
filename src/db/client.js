'use strict';

let Promise = require('bluebird')
  , cassandra = require('cassandra-driver')
  , AuthProvider = cassandra.auth.PlainTextAuthProvider
  , config = require('../config').cassandra
  , client;

function getClient() {
  client = client || Promise.promisifyAll(new cassandra.Client({
    contactPoints: [config.host],
    authProvider: new AuthProvider(config.username, config.password),
    keyspace: config.keyspace
  }));
  return client;
}

module.exports = getClient();
