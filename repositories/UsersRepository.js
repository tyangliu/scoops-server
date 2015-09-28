'use strict';

let db = require('../db/dbClient')()
  , cassandra = require('cassandra-driver')
  , bcrypt = require('bcryptjs')
  , async = require('async');

class User {

  constructor(
    userId, email, name, hashedPassword,
    groups, preferences,
    createdAt, lastModifiedAt, lastModifiedBy
  ) {
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

  createUser(email, password, name, voucher) {
    let promise = new Promise((resolve, reject) => async.waterfall([
      // (1) generate hashed password
      bcrypt.hash.bind(null, password, 8),
      // (2) build user model
      (err, hash, callback) => {
        let user = new User(
          cassandra.types.Uuid.random(), // userId
          email, // email
          name, // name
          hash, // hashedPassword
          new Set(), // groups
          new Map(), // preferences
          Date.now().toISOString(), // createdAt
          null, // lastModifiedAt
          null // lastModifiedBy
        );

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

        this.db.execute(query, [
          user.userId, user.email, user.name, user.hashedPassword,
          user.groups, user.preferences,
          user.createdAt, user.lastModifiedAt, user.lastModifiedBy
        ], { prepare: true }, (err, result) =>
          callback(err, user)
        );
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

        this.db.execute(query, [
          user.email, user.userId, user.name, user.hashedPassword,
          user.groups, user.preferences,
          user.createdAt, user.lastModifiedAt, user.lastModifiedBy
        ], { prepare: true }, (err, result) =>
          callback(err, user)
        );
      }
      // (5) resplve/reject promise
    ], (err, user) => err ? reject(err) : resolve(user)));

    return promise;
  }

}

module.exports = UsersRepository;
