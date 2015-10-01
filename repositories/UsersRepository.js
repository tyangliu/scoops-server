'use strict';

let db = require('../db/dbClient')()
  , cassandra = require('cassandra-driver')
  , restify = require('restify')
  , bcrypt = require('bcryptjs')
  , slugid = require('slugid')
  , async = require('async');

class User {

  constructor(
    userId, email, name, hashedPassword,
    groups, preferences,
    createdAt, updatedAt, revision
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

// trades a base64Uuid voucher for a transformation function,
// or identity function if voucher is invalid;
// for example, a voucher can grant a user admin group membership on signup
function redeemVoucher(voucher) {
  return user => user;
}

function createUser(email, password, name, voucher) {
  let promise = new Promise((resolve, reject) => async.waterfall([
    // (1) generate hashed password
    bcrypt.hash.bind(null, password, 8),
    // (2) build user model
    (hash, callback) => {
      let user = new User(
        cassandra.types.Uuid.random(), // userId
        email, // email
        name, // name
        hash, // hashedPassword
        [], // groups
        {}, // preferences
        (new Date()).toISOString(), // createdAt
        null, // lastModifiedAt
        null // lastModifiedBy
      );

      if (voucher) { user = this.redeemVoucher(voucher)(user); }

      callback(null, user);
    },
    // (3) persist to users_by_email table
    (user, callback) => {
      let query = `
        INSERT INTO users_by_email (
          email, user_id, name, hashed_password,
          groups, preferences,
          created_at, last_modified_at, last_modified_by)
        VALUES
          (?,?,?,?,?,?,?,?,?)
        IF NOT EXISTS;
      `;

      db.execute(query, [
        user.email, user.userId, user.name, user.hashedPassword,
        user.groups, user.preferences,
        user.createdAt, user.lastModifiedAt, user.lastModifiedBy
      ], { prepare: true }, (err, result) => {
        if (err) { return callback(err); }

        let applied = result.rows[0]['[applied]'];
        if (applied) { return callback(null, user); }

        let error = new restify.ConflictError('The email already exists');
        callback(error);
      });
    },
    // (4) persist to users table
    (user, callback) => {
      let query = `
        INSERT INTO users (
          user_id, email, name, hashed_password,
          groups, preferences,
          created_at, last_modified_at, last_modified_by)
        VALUES
          (?,?,?,?,?,?,?,?,?);
      `;

      db.execute(query, [
          user.userId, user.email, user.name, user.hashedPassword,
          user.groups, user.preferences,
          user.createdAt, user.lastModifiedAt, user.lastModifiedBy
        ], { prepare: true }, (err, result) => callback(err, user));
    },
    // (5) normalize fields
    (user, callback) => {
      user.userId = slugid.encode(user.userId.toString());
      callback(null, user);
    }
    // (6) resolve/reject promise
  ], (err, user) => err ? reject(err) : resolve(user)));

  return promise;
}

function findUserById(userId) {
  let promise = new Promise((resolve, reject) => {
    let query = `SELECT * FROM users WHERE user_id = ?`;

    userId = slugid.decode(userId);

    db.execute(query, [userId], { prepare: true }, (err, result) => {
      if (err) { return reject(err); }
      if (result.rows.length <= 0) { return resolve(null); }

      let row = result.rows[0];
      let user = new User(
        slugid.encode(row.user_id.toString()),
        row.email,
        row.name,
        row.hashed_password,
        row.groups,
        row.preferences,
        row.created_at.toISOString(),
        row.last_modified_at ? row.lastModifiedAt.toISOString() : null,
        row.last_modified_by ? slugid.encode(row.last_modified_by.toString()) : null
      );

      resolve(user);
    });
  });

  return promise;
}

function findUserByEmail(email) {
  let promise = new Promise((resolve, reject) => {
    let query = `SELECT * FROM users_by_email WHERE email = ?`;

    db.execute(query, [email], { prepare: true }, (err, result) => {
      if (err) { return reject(err); }
      if (result.rows.length <= 0) { return resolve(null); }

      let row = result.rows[0];
      let user = new User(
        slugid.encode(row.user_id.toString()),
        row.email,
        row.name,
        row.hashed_password,
        row.groups,
        row.preferences,
        row.created_at.toISOString(),
        row.last_modified_at ? row.lastModifiedAt.toISOString() : null,
        row.last_modified_by ? slugid.encode(row.last_modified_by.toString()) : null
      );

      return resolve(user);
    });
  });

  return promise;
}
