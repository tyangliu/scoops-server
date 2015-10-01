'use strict';

let db = require('../db/dbClient')()
  , dbHelpers = require('../db/dbHelpers')
  , cassandra = require('cassandra-driver')
  , restify = require('restify')
  , bcrypt = require('bcryptjs')
  , slugid = require('slugid')
  , async = require('async')
  , usersRepository = require('./usersRepository')
  , mapUserSummaryToModel = usersRepository.mapSummaryToModel
  , convertUserSummaryForPersist = usersRepository.convertSummaryForPersist;

/**
 * Event model
 */
class Event {
  constructor(
    id, name, linkName, imageUrl,
    startAt, endAt, published, publishedAt,
    creator, createdAt, updatedAt, revision
  ) {
    this.id = id;
    this.name = name;
    this.linkName = linkName;
    this.imageUrl = imageUrl;
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
 * Maps a row from any events* table to an Event object
 *
 * @param row {Object} a row from an events* table
 * @returns {Event}
 */
function mapRowToModel(row) {
  let id = slugid.encode(row.id.toString())
    , name = row.name
    , linkName = row.link_name
    , imageUrl = row.image_url
    , startAt = row.start_at.toISOString()
    , endAt = row.end_at.toISOString()
    , published = row.published
    , publishedAt = row.published_at.toISOString()
    , creator = mapUserSummaryToModel(row.creator)
    , createdAt = row.created_at.toISOString()
    , updatedAt = row.updated_at.toISOString()
    , revision = slugid.encode(row.revision.toString());

  return new Event(
    id, name, linkName, imageUrl,
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
  let options = options || {}
    , year = options.year || (new Date()).getFullYear()
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
 * @param imageUrl
 * @param startAt
 * @param endAt
 * @param published
 * @param creator
 * @returns {Promise.<Event>}
 */
function create(name, linkName, imageUrl, startAt, endAt, published, creator) {
  let promise = new Promise((resolve, reject) => async.waterfall([

    // (1) build event model
    function buildModel(callback) {
      let id = cassandra.types.TimeUuid.now()
        , linkName = linkName.toLowerCase()
        , creator = convertUserSummaryForPersist(creator)
        , createdAt = (new Date()).toISOString()
        , updatedAt = createdAt
        , publishedAt = published ? createdAt : null
        , revision = cassandra.types.TimeUuid.now();

      let event = new Event(
        id, name, linkName, imageUrl,
        startAt, endAt, published, publishedAt,
        creator, createdAt, updatedAt, revision
      );

      callback(null, event);
    },

    // (2) persist to events tables
    function persist(event, callback) {

    },

    // (3) normalize field types for rest of application
    function normalize(event, callback) {

    }

    // (4) resolve/reject promise
  ], (err, user) => err ? reject(err) : resolve(user)));

  return promise;
}
