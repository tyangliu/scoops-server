'use strict';

let Promise = require('bluebird')
  , db = require('../../db/client')
  , dbHelpers = require('../../db/helpers')
  , cassandra = require('cassandra-driver')
  , restify = require('restify')
  , slugid = require('slugid')
  , randtoken = require('rand-token')
  , usersRepository = require('../../users/repository');

/**
 * Client model
 */
class Client {
  constructor(id, secret, privileges, creator, createdAt) {
    this.id = id;
    this.secret = secret;
    this.privileges = privileges;
    this.creator = creator;
    this.createdAt = createdAt;
  }
}

/**
 * Maps a row from any clients* table to a Client object
 *
 * @param row {Object} a row from a clients* table
 * @returns {Client}
 */
let mapRowToModel = function(row) {
  let id = slugid.encode(row.id.toString())
    , secret = randtoken.generate(24)
    , privileges = row.privileges
    , creator = usersRepository.mapSummaryToModel(row.creator)
    , createdAt = row.created_at.toISOString();

  return new Client(id, secret, privileges, creator, createdAt);
};

/**
 * Finds a client by id from the database
 *
 * @param id {string} a base64 encoded client uuid
 * @returns {Promise.<Client>}
 */
let findById = function(id) {
  let query = `SELECT * FROM clients WHERE id = ?`
    , params = [slugid.decode(id)];

  return dbHelpers.find(query, params, {
    rowMapper: mapRowToModel,
    single: true
  });
};

/**
 * Finds a client by creator id from the database
 *
 * @param id {string} a base64 encoded user uuid
 * @returns {Promise.<Array.<Client>>}
 */
let findByCreator = function(creatorId) {
  let query = `SELECT * FROM clients_by_creator WHERE creator_id = ?`
    , params = [slugid.decode(creatorId)];

  return dbHelpers.find(query, params, { rowMapper: mapRowToModel });
};

/**
 * Creates and persists a new client
 *
 * @param creator {UserSummary} the user creating this client
 * @returns {Promise.<Client>}
 */
let create = Promise.coroutine(function *(creator) {
  let id = cassandra.types.Uuid.random()
    , secret = randtoken.generate(24)
    , privileges = []
    , createdAt = (new Date()).toISOString();

  creator = usersRepository.decodeSummary(creator);

  let queries = [
    {
      query: `
        INSERT INTO clients (
          id, secret, privileges, creator, created_at
        )
        VALUES (?,?,?,?,?)
      `,
      params: [
        id, secret, privileges, creator, createdAt
      ]
    },
    {
      query: `
        INSERT INTO clients_by_creator (
          creator_id, id, secret, privileges, creator, created_at
        )
        VALUES (?,?,?,?,?,?)
      `,
      params: [
        creator.id, id, secret, privileges, creator, createdAt
      ]
    }
  ];

  yield Promise.all(queries.map(item =>
    db.executeAsync(item.query, item.params, { prepare: true })
  ));

  id = slugid.encode(id.toString());
  creator = usersRepository.encodeSummary(creator);

  return new Client(id, secret, privileges, creator, createdAt);
});

module.exports = {
  findById,
  findByCreator,
  create
};
