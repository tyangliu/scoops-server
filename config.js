'use strict';

let nconf = require('nconf');

nconf.file('./config.json');

module.exports = {
  db: {
    host:     nconf.get('DB_HOST')     || '127.0.0.1',
    username: nconf.get('DB_USERNAME') || '',
    password: nconf.get('DB_PASSWORD') || ''
  }
};