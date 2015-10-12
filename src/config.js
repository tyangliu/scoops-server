'use strict';

let nconf = require('nconf');

nconf.file(__dirname + '/config.json');

module.exports = {
  cassandra: {
    host:     nconf.get('CASSANDRA_HOST')     || '127.0.0.1',
    username: nconf.get('CASSANDRA_USERNAME') || '',
    password: nconf.get('CASSANDRA_PASSWORD') || '',
    keyspace: nconf.get('CASSANDRA_KEYSPACE') || ''
  },
  redis: {
    host: nconf.get('REDIS_HOST') || '127.0.0.1',
    port: nconf.get('REDIS_PORT') || 6379
  },
  auth: {
    bearerTTL: 7200, // 2 hours
    refreshTTL: 5184000 // 60 days
  },
  uploads: {
    path: __dirname + '/../uploads/',
    articlesPath: __dirname + '/../uploads/articlesImages/',
    eventsPath: __dirname + '/../uploads/eventsImages/'
  }
};
