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
  }
};
