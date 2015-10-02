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
 * Article model
 */
class Article {
  constructor(
    id, name, linkName, imageId, content,
    published, publishedAt,
    creator, createdAt, updatedAt, revision
  ) {
    this.id = id;
    this.name = name;
    this.linkName = linkName;
    this.imageId = imageId;
    this.content = content;
    this.published = published;
    this.publishedAt = publishedAt;
    this.creator = creator;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.revision = revision;
  }
}

/**
 * Maps a row from any articles* table to an Article object
 *
 * @param row {Object} a row from an articles* table
 * @returns {Article}
 */
function mapRowToModel(row) {
  let id = slugid.encode(row.id.toString())
    , name = row.name
    , linkName = row.link_name
    , imageId = slugid.encode(row.image_id.toString())
    , content = row.content
    , published = row.published
    , publishedAt = row.published_at.toISOString()
    , creator = usersRepository.mapSummaryToModel(row.creator)
    , createdAt = row.created_at.toISOString()
    , updatedAt = row.updated_at.toISOString()
    , revision = slugid.encode(row.revision.toString());

  return new Article(
    id, name, linkName, imageId, content,
    published, publishedAt,
    creator, createdAt, updatedAt, revision
  );
}

/**
 * Finds an article by id from the database
 *
 * @param id {string} a base64 encoded article uuid
 * @returns {Promise.<Article>}
 */
function findById(id) {
  let query = `SELECT * FROM articles WHERE id = ?`
    , params = [slugid.decode(id)];

  return dbHelpers.find(query, params, {
    rowMapper: mapRowToModel,
    single: true
  });
}

/**
 * Finds an article by link name from the database
 *
 * @param linkName {string} a unique link name of an article
 * @returns {Promise.<Article>}
 */
function findByLinkName(linkName) {
  let query = `SELECT * FROM articles_by_link_name WHERE link_name = ?`
    , params = [linkName];

  return dbHelpers.find(query, params, {
    rowMapper: mapRowToModel,
    single: true
  });
}

function findByPublished(options) {
  options = options || {};
}

/**
 * Creates and persists a new article
 *
 * @param name
 * @param linkName
 * @param imageId
 * @param content
 * @param published
 * @param creator
 * @returns {Promise.<Article>}
 */
function create(name, linkName, imageId, content, published, creator) {
  let promise = new Promise((resolve, reject) => async.waterfall([

    // (1) build article model
    function buildModel(callback) {
      let id = cassandra.types.TimeUuid.now()
        , linkName = linkName.toLowerCase()
        , imageId = slugid.decode(imageId)
        , creator = usersRepository.decodeSummary(creator)
        , createdAt = (new Date()).toISOString()
        , updatedAt = createdAt
        , publishedAt = published ? createdAt : null
        , revision = cassandra.types.TimeUuid.now();

      let article = new Article(
        id, name, linkName, imageId, content,
        published, publishedAt,
        creator, createdAt, updatedAt, revision
      );

      callback(null, article);
    },

    // (2) persist to articles tables
    function persist(article, callback) {
      let queries = [
        {
          query: `
            INSERT INTO articles_by_link_name (
              link_name, id, name, image_id, content
              published, published_at,
              creator, created_at, updated_at, revision
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
            IF NOT EXISTS
          `,
          params: [
            article.linkName, article.id, article.name, article.imageId, article.content,
            article.published, article.publishedAt,
            article.creator, article.createdAt, article.updatedAt, article.revision
          ]
        },
        {
          query: `
            INSERT INTO articles (
              id, name, link_name, image_id, content,
              published, published_at,
              creator, created_at, updated_at, revision
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
          `,
          params: [
            article.id, article.name, article.linkName, article.imageId, article.content,
            article.published, article.publishedAt,
            article.creator, article.createdAt, article.updatedAt, article.revision
          ]
        },
        {
          query: `
            INSERT INTO articles_by_creator (
              creator_id, id, name, link_name,
              image_id, content,
              published, published_at,
              creator, created_at, updated_at, revision
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
          `,
          params: [
            article.creator.id, article.id, article.name, article.linkName,
            article.imageId, article.content,
            article.published, article.publishedAt,
            article.creator, article.createdAt, article.updatedAt, article.revision
          ]
        },
        {
          query: `
            INSERT INTO articles_change_log (
              id, revision, name, link_name,
              image_id, content,
              published, published_at,
              creator, created_at, updated_at
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
          `,
          params: [
            article.id, article.revision, article.name, article.linkName,
            article.imageId, article.content,
            article.published, article.publishedAt,
            article.creator, article.createdAt, article.updatedAt
          ]
        }
      ];

      if (article.published) {
        queries.push(
          {
            query: `
            INSERT INTO articles_by_published (
              published_year, published_at, id, name,
              link_name, image_id, content, published,
              creator, created_at, updated_at, revision
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
          `,
            params: [
              (new Date(article.publishedAt)).getFullYear(),
              article.publishedAt, article.id, article.name,
              article.linkName, article.imageId, article.content, article.published,
              article.creator, article.createdAt, article.updatedAt, article.revision
            ]
          }
        );
      }

      db.batch(queries, { prepare: true }, (err, result) => {
        if (err) {
          return callback(err);
        }
        if (result.rows[0]['[applied]']) {
          return callback(null, article);
        }
        callback(new restify.ConflictError(
          'An article with this link name already exists'
        ));
      });
    },

    // (3) normalize field types for rest of application
    function normalize(article, callback) {
      article.id = slugid.encode(article.id.toString());
      article.imageId = slugid.decode(article.imageId.toString());
      article.revision = slugid.encode(article.revision.toString());
      article.creator = usersRepository.encodeSummary(article.creator);
      callback(null, article);
    }

    // (4) resolve/reject promise
  ], (err, article) => err ? reject(err) : resolve(article)));

  return promise;
}
