'use strict';

let db = require('../db/dbClient')()
  , dbHelpers = require('../db/dbHelpers')
  , cassandra = require('cassandra-driver')
  , restify = require('restify')
  , bcrypt = require('bcryptjs')
  , slugid = require('slugid')
  , async = require('async')
  , usersRepository = require('./usersRepository');

/**
 * Event model
 */
class Event {
  constructor(
    id, name, location, linkName, imageId,
    startAt, endAt, published, publishedAt,
    creator, createdAt, updatedAt, revision
  ) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.linkName = linkName;
    this.imageId = imageId;
    this.startAt = startAt;
    this.endAt = endAt;
    this.published = published;
    this.publishedAt = publishedAt;
    this.creator = creator;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.revision = revision;
  }
}

/**
 * Location model, currently just for documentation since db result is
 * already in correct format
 */
class Location {
  constructor(name, latitude, longitude) {
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
  }
}

/**
 * Maps a row from any events* table to an Event object
 *
 * @param row {Object} a row from an events* table
 * @returns {Event}
 */
function mapRowToModel(row) {
  let id = slugid.encode(row.id.toString())
    , name = row.name
    , location = row.location
    , linkName = row.link_name
    , imageId = slugid.encode(row.image_id.toString())
    , startAt = row.start_at.toISOString()
    , endAt = row.end_at.toISOString()
    , published = row.published
    , publishedAt = row.published_at.toISOString()
    , creator = usersRepository.mapSummaryToModel(row.creator)
    , createdAt = row.created_at.toISOString()
    , updatedAt = row.updated_at.toISOString()
    , revision = slugid.encode(row.revision.toString());

  return new Event(
    id, name, location, linkName, imageId,
    startAt, endAt, published, publishedAt,
    creator, createdAt, updatedAt, revision
  );
}

/**
 * Finds an event by id from the database
 *
 * @param id {string} a base64 encoded event uuid
 * @returns {Promise.<Event>}
 */
function findById(id) {
  let query = `SELECT * FROM events WHERE id = ?`
    , params = [slugid.decode(id)];

  return dbHelpers.find(query, params, {
    rowMapper: mapRowToModel,
    single: true
  });
}

/**
 * Finds an event by link name from the database
 *
 * @param linkName {string} a unique link name of an event
 * @returns {Promise.<Event>}
 */
function findByLinkName(linkName) {
  let query = `SELECT * FROM events_by_link_name WHERE link_name = ?`
    , params = [linkName];

  return dbHelpers.find(query, params, {
    rowMapper: mapRowToModel,
    single: true
  });
}

/**
 * Finds events based on event start datetimes
 *
 * @param options.year {int} event start year to include events from
 * @param option.minStartAt {string} an ISO format date, indicating
 * the min start datetime of events that should be included. inclusive
 * @param options.maxStartAt {string} an ISO format date, indicating
 * the max start datetime of events that should be included, exclusive
 * @param options.count {int} the max number of events that should be
 * returned
 * @param options.order {string} whether the result should be in
 * ascending or descending order of start datetime
 * @return {Promise.Array.<Event>}
 */
function findByStart(options) {
  options = options || {};

  let year = options.year || (new Date()).getFullYear()
    , minStartAt = options.minStartAt
    , maxStartAt = options.maxStartAt
    , count = options.limit
    , order = options.order;

  let query = 'SELECT * FROM events_by_start WHERE start_year = ?'
            + minStartAt      ? ' AND start_at >= ?'      : ''
            + maxStartAt      ? ' AND start_at < ?'       : ''
            + count           ? ' LIMIT ?'                : ''
            + order == 'DESC' ? ' ORDER BY start_at DESC' : '';

  let params = [year].concat(
    minStartAt || [],
    maxStartAt || [],
    count      || []
  );

  return dbHelpers.find(query, params, {
    rowMapper: mapRowToModel
  });
}

/**
 * Creates and persists a new event
 *
 * @param name
 * @param linkName
 * @param imageId
 * @param startAt
 * @param endAt
 * @param published
 * @param creator
 * @returns {Promise.<Event>}
 */
function create(name, location, linkName, imageId, startAt, endAt, published, creator) {
  let promise = new Promise((resolve, reject) => async.waterfall([

    // (1) build event model
    function buildModel(callback) {
      let id = cassandra.types.TimeUuid.now()
        , linkName = linkName.toLowerCase()
        , imageId = slugid.decode(imageId)
        , creator = usersRepository.decodeSummary(creator)
        , createdAt = (new Date()).toISOString()
        , updatedAt = createdAt
        , publishedAt = published ? createdAt : null
        , revision = cassandra.types.TimeUuid.now();

      let event = new Event(
        id, name, location, linkName, imageId,
        startAt, endAt, published, publishedAt,
        creator, createdAt, updatedAt, revision
      );

      callback(null, event);
    },

    // (2) persist to events tables
    function persist(event, callback) {
      let queries = [
        {
          query: `
            INSERT INTO events_by_link_name (
              link_name, id, name, location, image_id,
              start_at, end_at, published, published_at,
              creator, created_at, updated_at, revision
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            IF NOT EXISTS
          `,
          params: [
            event.linkName, event.id, event.name, event.location, event.imageId,
            event.startAt, event.endAt, event.published, event.publishedAt,
            event.creator, event.createdAt, event.updatedAt, event.revision
          ]
        },
        {
          query: `
            INSERT INTO events (
              id, name, location, link_name, image_id,
              start_at, end_at, published, published_at,
              creator, created_at, updated_at, revision
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
          `,
          params: [
            event.id, event.name, event.location, event.linkName, event.imageId,
            event.startAt, event.endAt, event.published, event.publishedAt,
            event.creator, event.createdAt, event.updatedAt, event.revision
          ]
        },
        {
          query: `
            INSERT INTO events_by_creator (
              creator_id, id, name, location,
              link_name, image_id, start_at, end_at,
              published, published_at,
              creator, created_at, updated_at, revision
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
          `,
          params: [
            event.creator.id, event.id, event.name, event.location,
            event.linkName, event.imageId, event.startAt, event.endAt,
            event.published, event.publishedAt,
            event.creator, event.createdAt, event.updatedAt, event.revision
          ]
        },
        {
          query: `
            INSERT INTO events_by_start (
              start_year, start_at, id, name, location,
              link_name, image_id, end_at,
              published, published_at,
              creator, created_at, updated_at, revision
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
          `,
          params: [
            (new Date(event.startAt)).getFullYear(),
            event.startAt, event.id, event.name, event.location,
            event.linkName, event.imageId, event.endAt,
            event.published, event.publishedAt,
            event.creator, event.createdAt, event.updatedAt, event.revision
          ]
        },
        {
          query: `
            INSERT INTO events_change_log (
              id, revision, name, location,
              link_name, image_id, start_at, end_at,
              published, published_at,
              creator, created_at, updated_at
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
          `,
          params: [
            event.id, event.revision, event.name, event.location,
            event.linkName, event.imageId, event.startAt, event.endAt,
            event.published, event.publishedAt,
            event.creator, event.createdAt, event.updatedAt
          ]
        }
      ];

      db.batch(queries, { prepare: true }, (err, result) => {
        if (err) {
          return callback(err);
        }
        if (result.rows[0]['[applied]']) {
          return callback(null, event);
        }
        callback(new restify.ConflictError(
          'An event with this link name already exists'
        ));
      });
    },

    // (3) normalize field types for rest of application
    function normalize(event, callback) {
      event.id = slugid.encode(event.id.toString());
      event.imageId = slugid.decode(event.imageId.toString());
      event.revision = slugid.encode(event.revision.toString());
      event.creator = usersRepository.encodeSummary(event.creator);
      callback(null, event);
    }

    // (4) resolve/reject promise
  ], (err, event) => err ? reject(err) : resolve(event)));

  return promise;
}

function update() {

}

function remove() {

}
