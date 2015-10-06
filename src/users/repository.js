'use strict';

let Promise = require('bluebird')
  , db = require('../db/client')
  , dbHelpers = require('../db/helpers')
  , cassandra = require('cassandra-driver')
  , restify = require('restify')
  , bcrypt = Promise.promisifyAll(require('bcryptjs'))
  , slugid = require('slugid');

/**
 * User model
 */
class User {
  constructor(
    id, email, name, hashedPassword,
    avatarUrl, groups, preferences,
    createdAt, updatedAt, revision
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.hashedPassword = hashedPassword;
    this.avatarUrl = avatarUrl;
    this.groups = groups;
    this.preferences = preferences;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.revision = revision;
  }
}

/**
 * User summary model
 */
class UserSummary {
  constructor(id, email, name) {
    this.id = id;
    this.email = email;
    this.name = name;
  }
}

/**
 * Maps a user_summary UDT from a table to a UserSummary object,
 * used by repositories of tables with embedded user_summary
 *
 * @param summary {Object} a user_summary UDT query result
 * @returns {UserSummary}
 */
let mapSummaryToModel = function(summary) {
  let id = slugid.encode(summary.id.toString())
    , email = summary.email
    , name = summary.name;

  return new UserSummary(id, email, name);
};

/**
 * Transforms a UserSummary with id decoded from base64
 * in preparation of persisting to db
 *
 * @param summary {UserSummary}
 * @return {Object} user summary with decoded id
 */
let decodeSummary = function(summary) {
  summary.id = slugid.decode(summary.id);
  return summary;
};

/**
 * Transforms a UserSummary with id encoded to base64
 *
 * @param summary {Object} user summary with decoded id
 * @return {Object} user summary with encoded id
 */
let encodeSummary = function(summary) {
  summary.id = slugid.encode(summary.id);
  return summary;
};

/**
 * Maps a row from any users* table to a User object
 *
 * @param row {Object} a row from a users* table
 * @returns {User}
 */
let mapRowToModel = function(row) {
  let id = slugid.encode(row.id.toString())
    , email = row.email
    , name = row.name
    , hashedPassword = row.hashed_password
    , avatarUrl = row.avatar_url
    , groups = row.groups || []
    , preferences = row.preferences || {}
    , createdAt = row.created_at.toISOString()
    , updatedAt = row.updated_at.toISOString()
    , revision = slugid.encode(row.revision.toString());

  return new User(
    id, email, name, hashedPassword,
    avatarUrl, groups, preferences,
    createdAt, updatedAt, revision
  );
};

/**
 * Finds a user by id from the database
 *
 * @param id {string} a base64 encoded user uuid
 * @returns {Promise.<User>}
 */
let findById = function(id) {
  let query = `SELECT * FROM users WHERE id = ?`
    , params = [slugid.decode(id)];

  return dbHelpers.find(query, params, {
    rowMapper: mapRowToModel,
    single: true
  });
};

/**
 * Finds a user by email from the database
 *
 * @param email {string}
 * @returns {Promise.<User>}
 */
let findByEmail = function(email) {
  let query = `SELECT * FROM users_by_email WHERE email = ?`
    , params = [email.toLowerCase()];

  return dbHelpers.find(query, params, {
    rowMapper: mapRowToModel,
    single: true
  });
};

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
let create = Promise.coroutine(function *(email, password, name, voucher) {
  let id = cassandra.types.Uuid.random()
    , hashedPassword = yield bcrypt.hashAsync(password, 8)
    , avatarUrl = null
    , groups = []
    , preferences = {}
    , createdAt = (new Date()).toISOString()
    , updatedAt = createdAt
    , revision = cassandra.types.TimeUuid.now();

  email = email.toLowerCase();

  let query = `
    INSERT INTO users_by_email (
      email, id, name, hashed_password,
      avatar_url, groups, preferences,
      created_at, updated_at, revision
    )
    VALUES (?,?,?,?,?,?,?,?,?,?)
    IF NOT EXISTS
  `;

  let params = [
    email, id, name, hashedPassword,
    avatarUrl, groups, preferences,
    createdAt, updatedAt, revision
  ];

  let result = yield db.executeAsync(query, params, { prepare: true });

  if (!result.rows[0]['[applied]']) {
    throw new restify.ConflictError('The email already exists.');
  }

  let batchQueries = [
    {
      query: `
        INSERT INTO users (
          id, email, name, hashed_password,
          avatar_url, groups, preferences,
          created_at, updated_at, revision
        )
        VALUES (?,?,?,?,?,?,?,?,?,?)
      `,
      params: [
        id, email, name, hashedPassword,
        avatarUrl, groups, preferences,
        createdAt, updatedAt, revision
      ]
    },
    {
      query: `
        INSERT INTO users_change_log (
          id, revision, email, name, hashed_password,
          avatar_url, groups, preferences,
          created_at, updated_at
        )
        VALUES (?,?,?,?,?,?,?,?,?,?)
      `,
      params: [
        id, revision, email, name, hashedPassword,
        avatarUrl, groups, preferences,
        createdAt, updatedAt
      ]
    }
  ];

  yield db.batchAsync(batchQueries, { prepare: true });

  id = slugid.encode(id.toString());
  revision = slugid.encode(revision.toString());

  return new User(
    id, email, name, hashedPassword,
    avatarUrl, groups, preferences,
    createdAt, updatedAt, revision
  );
});

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
let update = function(id, fields, options) {
  options = options || {};

  // TODO: implement this and add to exports when needed :)
  let promise = new Promise((resolve, reject) => {});
  return promise;
};

module.exports = {
  UserSummary,
  mapSummaryToModel,
  decodeSummary,
  encodeSummary,
  findById,
  findByEmail,
  create
};
