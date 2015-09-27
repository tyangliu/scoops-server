'use strict';

let db = require('../db/dbClient')()
  , cassandra = require('cassandra-driver')
  , bcrypt = require('bcryptjs')
  , async = require('async');

class User {

  constructor({
    userId, email, name, hashedPassword,
    groups=[], preferences={},
    createdAt, lastModifiedAt, lastModifiedBy
  }) {
    this.userId = userId;
    this.email = email;
    this.name = name;
    this.hashedPassword = hashedPassword;
    this.groups = groups;
    this.preferences = preferences;
    this.createdAt = createdAt;
    this.lastModifiedAt = lastModifiedAt;
    this.lastModifiedBy = lastModifiedBy;
  }

}

class UsersRepository {

  constructor() { this.db = db; }

  // trades a base64Uuid voucher for a transformation function,
  // or identity function if voucher is invalid;
  // for example, a voucher can grant a user admin group membership on signup
  redeemVoucher(voucher) {
    return user => user;
  }

  createUser(email, password, name, voucher=null) {
    async.waterfall([
      // (1) generate hashed password
      bcrypt.hash.bind(null, password, 8),
      // (2) build user model
      (err, hash, callback) => {
        let user = new User({
          userId: cassandra.types.Uuid.random(),
          email,
          name,
          hashedPassword: hash,
          groups: [],
          preferences: {},
          createdAt: 'TODO',
          lastModifiedAt: 'TODO',
          lastModifiedBy: 'TODO'
        });

        if (voucher) {
          user = this.redeemVoucher(voucher)(user);
        }

        callback(null, user);
      },
      // (3) persist to users table
      (user, callback) => {
        let query = `
          INSERT INTO users (
            user_id, email, name, hashed_password,
            groups, preferences,
            created_at, last_modified_at, last_modified_by
          ) VALUES (?,?,?,?,?,?,?,?,?) IF NOT EXISTS;
        `;

        callback(null, user);
      },
      // (4) persist to users_by_email table
      (user, callback) => {
        let query = `
          INSERT INTO users_by_email (
            email, user_id, name, hashed_password,
            groups, preferences,
            created_at, last_modified_at, last_modified_by
          ) VALUES (?,?,?,?,?,?,?,?,?) IF NOT EXISTS;
        `;

        callback(null, user);
      }
      // (5) pass user object or error to caller callback
    ], (err, user) => {

    });
  }

}