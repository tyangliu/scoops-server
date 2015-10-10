'use strict';

let Promise = require('bluebird')
  , db = require('../db/client')
  , dbHelpers = require('../db/helpers')
  , cassandra = require('cassandra-driver')
  , restify = require('restify')
  , slugid = require('slugid')
  , async = require('async')
  , usersRepository = require('../users/repository');

/**
 * Event model
 */
class Event {
  constructor(
    id, name, location, linkName, imageUrl,
    startAt, endAt, published, publishedAt,
    creator, createdAt, updatedAt, revision
  ) {
    this.id = id;
    this.name = name;
    this.location = location;
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
let mapRowToModel = function(row) {
  let id = slugid.encode(row.id.toString())
    , name = row.name
    , location = row.location
    , linkName = row.link_name
    , startAt = row.start_at.toISOString()
    , endAt = row.end_at.toISOString()
    , published = row.published
    , publishedAt = row.published_at.toISOString()
    , creator = usersRepository.mapSummaryToModel(row.creator)
    , createdAt = row.created_at.toISOString()
    , updatedAt = row.updated_at.toISOString()
    , revision = slugid.encode(row.revision.toString());

  return new Event(
    id, name, location, linkName, imageUrl,
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
let findById = function(id) {
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
let findByLinkName = function(linkName) {
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
let findByStart = function(options) {
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
 * @param imageUrl
 * @param startAt
 * @param endAt
 * @param published
 * @param creator
 * @returns {Promise.<Event>}
 */
let create = Promise.coroutine(function *(name, location, linkName, startAt, endAt, published, creator) {
  let id = cassandra.types.TimeUuid.now()
    , imageUrl = null
    , createdAt = (new Date()).toISOString()
    , updatedAt = createdAt
    , publishedAt = published ? createdAt : null
    , revision = cassandra.types.TimeUuid.now();

  linkName = linkName.toLowerCase();
  creator = usersRepository.decodeSummary(creator);

  let query = `
    INSERT INTO events_by_link_name (
      link_name, id, name, location, image_url,
      start_at, end_at, published, published_at,
      creator, created_at, updated_at, revision
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    IF NOT EXISTS
  `;
  
  let params = [
    linkName, id, name, location, imageUrl,
    startAt, endAt, published, publishedAt,
    creator, createdAt, updatedAt, revision
  ];

  let result = yield db.executeAsync(query, params, { prepare: true });

  if (!result.rows[0]['[applied]']) {
    throw new restify.ConflictError('An article with the link name already exists.');
  }

  let batchQueries = [
    {
      query: `
        INSERT INTO events (
          id, name, location, link_name, image_url,
          start_at, end_at, published, published_at,
          creator, created_at, updated_at, revision
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      params: [
        id, name, location, linkName, imageUrl,
        startAt, endAt, published, publishedAt,
        creator, createdAt, updatedAt, revision
      ]
    },
    {
      query: `
        INSERT INTO events_by_creator (
          creator_id, id, name, location,
          link_name, image_url, start_at, end_at,
          published, published_at,
          creator, created_at, updated_at, revision
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      params: [
        creator.id, id, name, location,
        linkName, imageUrl, startAt, endAt,
        published, publishedAt,
        creator, createdAt, updatedAt, revision
      ]
    },
    {
      query: `
        INSERT INTO events_by_start (
          start_year, start_at, id, name, location,
          link_name, image_url, end_at,
          published, published_at,
          creator, created_at, updated_at, revision
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      params: [
        (new Date(startAt)).getFullYear(),
        startAt, id, name, location,
        linkName, imageUrl, endAt,
        published, publishedAt,
        creator, createdAt, updatedAt, revision
      ]
    },
    {
      query: `
        INSERT INTO events_change_log (
          id, revision, name, location,
          link_name, image_url, start_at, end_at,
          published, published_at,
          creator, created_at, updated_at
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      params: [
        id, revision, name, location,
        linkName, imageUrl, startAt, endAt,
        published, publishedAt,
        creator, createdAt, updatedAt
      ]
    }
  ];

  yield db.batchAsync(batchQueries, { prepare: true });

  id = slugid.encode(id.toString());
  revision = slugid.encode(revision.toString());
  creator = usersRepository.encodeSummary(creator);

  return new Event(
    id, name, location, linkName, imageUrl,
    startAt, endAt, published, publishedAt,
    creator, createdAt, updatedAt, revision
  );
});

let update = function() {

};

let remove = function() {

};

module.exports = {
  findById,
  findByLinkName,
  findByStart,
  create
};
