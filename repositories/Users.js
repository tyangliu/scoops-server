'use strict';

let db = require('./dbClient');

class User {
  constructor(id, username, password, role, permissions=[], preferences={}, timestamp) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.role = role;
    this.permissions = permissions;
    this.preferences = preferences;
    this.timestamp = timestamp;
  }
}

class UserRepository {
  constructor() { this.db = db(); }
}
