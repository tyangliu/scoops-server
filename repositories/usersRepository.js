'use strict';

let db = require('../db/dbClient')()
  , cassandra = require('cassandra-driver')
  , restify = require('restify')
  , bcrypt = require('bcryptjs')
  , slugid = require('slugid')
  , async = require('async');

/**
 * User model
 */
class User {
  constructor(
    id, email, name, hashedPassword,
    groups, preferences,
    createdAt, updatedAt, revision
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.hashedPassword = hashedPassword;
    this.groups = groups;
    this.preferences = preferences;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.revision = revision;
  }
}

/**
 * Maps a row from any users* table to a User object
 *
 * @param row a row from a users* table
 * @returns {User}
 */
function mapRowToModel(row) {
  let id = slugid.encode(row.id.toString())
    , email = row.email
    , name = row.name
    , hashedPassword = row.hashed_password
    , groups = row.groups
    , preferences = row.preferences
    , createdAt = row.created_at.toISOString()
    , updatedAt = row.updated_at.toISOString()
    , revision = slugid.encode(row.revision.toString());

  return new User(
    id, email, name, hashedPassword,
    groups, preferences,
    createdAt, updatedAt, revision
  );
}

/**
 * Finds a user by id from the database
 *
 * @param id {string} a base64 encoded user uuid
 * @returns {Promise.<User>}
 */
function findById(id) {
  let promise = new Promise((resolve, reject) => {
    let query = `SELECT * FROM users WHERE id = ?`;

    id = slugid.decode(id);

    db.execute(query, [id], { prepare: true }, (err, result) => {
      if (err) { return reject(err); }
      if (result.rows.length <= 0) { return resolve(null); }

      let user = mapRowToModel(result.rows[0]);
      resolve(user);
    });
  });

  return promise;
}

/**
 * Finds a user by email from the database
 *
 * @param email {string}
 * @returns {Promise.<User>}
 */
function findByEmail(email) {
  let promise = new Promise((resolve, reject) => {
    let query = `SELECT * FROM users_by_email WHERE email = ?`;

    email = email.toLowerCase();

    db.execute(query, [email], { prepare: true }, (err, result) => {
      if (err) { return reject(err); }
      if (result.rows.length <= 0) { return resolve(null); }

      let user = mapRowToModel(result.rows[0]);
      return resolve(user);
    });
  });

  return promise;
}

/**
 * Creates and persists a new user
 *
 * @param email {string} email address of the new user
 * @param password {string} unhashed password of the new user
 * @param name {string} name of the new user
 * @param voucher {string} a base64 encoded voucher id, used to exchange for
 * special privileges such as admin permissions on user creation
 * @returns {Promise.<User>}
 */
function create(email, password, name, voucher) {
  let promise = new Promise((resolve, reject) => async.waterfall([

    // (1) generate hashed password
    bcrypt.hash.bind(null, password, 8),

    // (2) build user model
    function buildModel(hash, callback) {
      let id = cassandra.types.Uuid.random()
        , email = email.toLowerCase()
        , hashedPassword = hash
        , groups = []
        , preferences = {}
        , createdAt = (new Date()).toISOString()
        , updatedAt = createdAt
        , revision = cassandra.types.TimeUuid.now();

      let user = new User(
        id, email, name, hashedPassword,
        groups, preferences,
        createdAt, updatedAt, revision
      );

      return callback(null, user);
    },

    // (3) transform user model based on registration voucher if provided
    function redeemVoucher(user, callback) {
      return callback(null, user);
    },

    // (3) persist to users tables
    function persist(user, callback) {
      let queries = [
        {
          query: `
            INSERT INTO users_by_email (
              email, id, name, hashed_password,
              groups, preferences,
              created_at, updated_at, revision
            )
            VALUES (?,?,?,?,?,?,?,?,?)
            IF NOT EXISTS
          `,
          params: [
            user.email, user.id, user.name, user.hashedPassword,
            user.groups, user.preferences,
            user.createdAt, user.updatedAt, user.revision
          ]
        },
        {
          query: `
            INSERT INTO users (
              id, email, name, hashed_password,
              groups, preferences,
              created_at, updated_at, revision
            )
            VALUES (?,?,?,?,?,?,?,?,?)
          `,
          params: [
            user.id, user.email, user.name, user.hashedPassword,
            user.groups, user.preferences,
            user.createdAt, user.updatedAt, user.revision
          ]
        },
        {
          query: `INSERT INTO users_change_log (
            id, revision, email, name, hashed_password,
            groups, preferences,
            created_at, updated_at
          )
          VALUES (?,?,?,?,?,?,?,?,?)
          `,
          params: [
            user.id, user.revision, user.email, user.name, user.hashedPassword,
            user.groups, user.preferences,
            user.createdAt, user.updatedAt
          ]
        }
      ];

      db.batch(queries, { prepare: true }, (err, result) => {
        if (err) {
          return callback(err);
        }
        if (result.rows[0]['[applied]']) {
          return callback(null, user);
        }
        return callback(new restify.ConflictError(
          'The email already exists'
        ));
      });
    },

    // (5) normalize field types for rest of application
    function normalize(user, callback) {
      user.id = slugid.encode(user.id.toString());
      user.revision = slugid.encode(user.revision.toString());
      return callback(null, user);
    }

    // (6) resolve/reject promise
  ], (err, user) => err ? reject(err) : resolve(user)));

  return promise;
}

/**
 * Updates the provided fields of a user
 *
 * @param id {string} a base64 encoded user uuid
 * @param fields.name {string}
 * @param fields.password {string}
 * @param fields.groups {Array.<string>} array of group names
 * @param fields.preferences {Object.<string, string>} key-value pairs of preferences
 * @param options.discrete {boolean} whether or not collection fields should be
 * updated discretely (i.e. appended to existing instead of overwriting);
 * defaults to true if not provided
 * @returns {Promise.<User>} resolves to a User with the updated fields
 */
function update(id, fields, options) {
  // TODO: implement this and add to exports when needed :)
  let promise = new Promise((resolve, reject) => {});
  return promise;
}

module.exports = { findById, findByEmail, create };
