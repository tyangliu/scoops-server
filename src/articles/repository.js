'use strict';

let Promise = require('bluebird')
  , db = require('../db/client')
  , dbHelpers = require('../db/helpers')
  , cassandra = require('cassandra-driver')
  , restify = require('restify')
  , bcrypt = require('bcryptjs')
  , slugid = require('slugid')
  , async = require('async')
  , usersRepository = require('../users/repository');

/**
 * Article model
 */
class Article {
  constructor(
    id, name, linkName, imageUrl, content,
    published, publishedAt,
    creator, createdAt, updatedAt, revision
  ) {
    this.id = id;
    this.name = name;
    this.linkName = linkName;
    this.imageUrl = imageUrl;
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
let mapRowToModel = function(row) {
  let id = slugid.encode(row.id.toString())
    , name = row.name
    , linkName = row.link_name
    , imageUrl = row.image_url
    , content = row.content
    , published = row.published
    , publishedAt = row.published_at.toISOString()
    , creator = usersRepository.mapSummaryToModel(row.creator)
    , createdAt = row.created_at.toISOString()
    , updatedAt = row.updated_at.toISOString()
    , revision = slugid.encode(row.revision.toString());

  return new Article(
    id, name, linkName, imageUrl, content,
    published, publishedAt,
    creator, createdAt, updatedAt, revision
  );
};

/**
 * Finds an article by id from the database
 *
 * @param id {string} a base64 encoded article uuid
 * @returns {Promise.<Article>}
 */
let findById = function(id) {
  let query = `SELECT * FROM articles WHERE id = ?`
    , params = [slugid.decode(id)];

  return dbHelpers.find(query, params, {
    rowMapper: mapRowToModel,
    single: true
  });
};

/**
 * Finds an article by link name from the database
 *
 * @param linkName {string} a unique link name of an article
 * @returns {Promise.<Article>}
 */
let findByLinkName = function(linkName) {
  let query = `SELECT * FROM articles_by_link_name WHERE link_name = ?`
    , params = [linkName];

  return dbHelpers.find(query, params, {
    rowMapper: mapRowToModel,
    single: true
  });
};

let findByPublished = function(options) {
  options = options || {};
};

/**
 * Creates and persists a new article
 *
 * @param name
 * @param linkName
 * @param imageUrl
 * @param content
 * @param published
 * @param creator
 * @returns {Promise.<Article>}
 */
let create = Promise.coroutine(function *(name, linkName, content, published, publishedAt, creator) {
  let id = cassandra.types.TimeUuid.now()
    , imageUrl = null
    , createdAt = (new Date()).toISOString()
    , updatedAt = createdAt
    , revision = cassandra.types.TimeUuid.now();

  publishedAt = publishedAt || published ? createdAt : null;

  linkName = linkName.toLowerCase();
  creator = usersRepository.decodeSummary(creator);

  let query = `
    INSERT INTO articles_by_link_name (
      link_name, id, name, image_url, content,
      published, published_at,
      creator, created_at, updated_at, revision
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
    IF NOT EXISTS
  `;

  let params = [
    linkName, id, name, imageUrl, content,
    published, publishedAt,
    creator, createdAt, updatedAt, revision
  ];

  let result = yield db.executeAsync(query, params, { prepare: true });

  if (!result.rows[0]['[applied]']) {
    throw new restify.ConflictError('An article with the link name already exists.');
  }

  let queries = [
    {
      query: `
        INSERT INTO articles (
          id, name, link_name, image_url, content,
          published, published_at,
          creator, created_at, updated_at, revision
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `,
      params: [
        id, name, linkName, imageUrl, content,
        published, publishedAt,
        creator, createdAt, updatedAt, revision
      ]
    },
    {
      query: `
        INSERT INTO articles_by_creator (
          creator_id, id, name, link_name,
          image_url, content,
          published, published_at,
          creator, created_at, updated_at, revision
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      params: [
        creator.id, id, name, linkName,
        imageUrl, content,
        published, publishedAt,
        creator, createdAt, updatedAt, revision
      ]
    },
    {
      query: `
        INSERT INTO articles_change_log (
          id, revision, name, link_name,
          image_url, content,
          published, published_at,
          creator, created_at, updated_at
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `,
      params: [
        id, revision, name, linkName,
        imageUrl, content,
        published, publishedAt,
        creator, createdAt, updatedAt
      ]
    }
  ];

  (published) && queries.push(
    {
      query: `
        INSERT INTO articles_by_published (
          published_year, published_at, id, name,
          link_name, image_url, content, published,
          creator, created_at, updated_at, revision
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      params: [
        (new Date(publishedAt)).getFullYear(),
        publishedAt, id, name,
        linkName, imageUrl, content, published,
        creator, createdAt, updatedAt, revision
      ]
    }
  );

  yield Promise.all(queries.map(item =>
    db.executeAsync(item.query, item.params, { prepare: true })
  ));

  id = slugid.encode(id.toString());
  revision = slugid.encode(revision.toString());
  creator = usersRepository.encodeSummary(creator);

  return new Article(
    id, name, linkName, imageUrl, content,
    published, publishedAt,
    creator, createdAt, updatedAt, revision
  );
});

/**
 * Updates the fields of an existing article in the db
 *
 * @param id {string} a base-64 encoded article uuid
 * @param fields {Object} the fields to update
 * @return {Article} the updated article object
 */
let update = Promise.coroutine(function *(id, fields) {
  let article = yield findById(id);

  if (!article) {
    throw new restify.NotFoundError(`Article with id ${id} does not exist.`);
  }

  let isNewlyPublished = !article.published && fields.published && !article.publishedAt;

  let name = fields.name || article.name
    , linkName = article.linkName
    , imageUrl = fields.imageUrl || article.imageUrl
    , content = fields.content || article.content
    , creator = usersRepository.decodeSummary(article.creator)
    , createdAt = article.createdAt
    , updatedAt = (new Date()).toISOString()
    , published = (fields.published !== undefined) ? fields.published : article.published
    , publishedAt = isNewlyPublished ? updatedAt : article.publishedAt
    , currRevision = slugid.decode(article.revision)
    , newRevision = cassandra.types.TimeUuid.now();

  id = slugid.decode(id);

  let query = `
    UPDATE articles
    SET name = ?, image_url = ?, content = ?, published = ?,
        published_at = ?, updated_at = ?, revision = ?
    WHERE id = ?
    IF revision = ?
  `;

  let params = [
    name, imageUrl, content, published,
    publishedAt, updatedAt, newRevision,
    id, currRevision
  ];

  let result = yield db.executeAsync(query, params, { prepare: true });

  if (!result.rows[0]['[applied]']) {
    throw new restify.ConflictError('The article may have been updated by someone else.');
  }

  let queries = [
    {
      query: `
        UPDATE articles_by_link_name
        SET name = ?, image_url = ?, content = ?, published = ?,
            published_at = ?, updated_at = ?, revision = ?
        WHERE link_name = ?
      `,
      params: [
        name, imageUrl, content, published,
        publishedAt, updatedAt, newRevision,
        linkName
      ]
    },
    {
      query: `
        UPDATE articles_by_creator
        SET name = ?, image_url = ?, content = ?, published = ?,
            published_at = ?, updated_at = ?, revision = ?
        WHERE creator_id = ? AND id = ?
      `,
      params: [
        name, imageUrl, content, published,
        publishedAt, updatedAt, newRevision,
        creator.id, id
      ]
    },
    {
      query: `
        INSERT INTO articles_change_log (
          id, revision, name, link_name,
          image_url, content,
          published, published_at,
          creator, created_at, updated_at
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `,
      params: [
        id, newRevision, name, linkName,
        imageUrl, content,
        published, publishedAt,
        creator, createdAt, updatedAt
      ]
    }
  ];

  queries.push(isNewlyPublished ?
    {
      query: `
      INSERT INTO articles_by_published (
        published_year, published_at, id, name,
        link_name, image_url, content, published,
        creator, created_at, updated_at, revision
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `,
      params: [
        (new Date(publishedAt)).getFullYear(),
        publishedAt, id, name,
        linkName, imageUrl, content, published,
        creator, createdAt, updatedAt, newRevision
      ]
    } :
    {
      query: `
        UPDATE articles_by_published
        SET name = ?, image_url = ?, content = ?, published = ?,
            updated_at = ?, revision = ?
        WHERE published_year = ? AND published_at = ? and id = ?
      `,
      params: [
        name, imageUrl, content, published,
        updatedAt, newRevision,
        (new Date(publishedAt)).getFullYear(), publishedAt, id
      ]
    }
  );

  yield Promise.all(queries.map(item =>
    db.executeAsync(item.query, item.params, { prepare: true })
  ));

  id = slugid.encode(id.toString());
  newRevision = slugid.encode(newRevision.toString());
  creator = usersRepository.encodeSummary(creator);

  return new Article(
    id, name, linkName, imageUrl, content,
    published, publishedAt,
    creator, createdAt, updatedAt, newRevision
  );
});

module.exports = {
  findById,
  findByLinkName,
  findByPublished,
  create,
  update
};
