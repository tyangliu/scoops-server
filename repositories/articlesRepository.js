'use strict';

let db = require('../db/dbClient')()
  , dbHelpers = require('../db/dbHelpers')
  , cassandra = require('cassandra-driver')
  , restify = require('restify')
  , bcrypt = require('bcryptjs')
  , slugid = require('slugid')
  , async = require('async')
  , mapUserSummaryToModel = require('./usersRepository').mapSummaryToModel;;

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
function mapRowToModel(row) {
  let id = slugid.encode(row.id.toString())
    , name = row.name
    , linkName = row.link_name
    , imageUrl = row.image_url
    , content = row.content
    , published = row.published
    , publishedAt = row.published_at.toISOString()
    , creator = mapUserSummaryToModel(row.creator)
    , createdAt = row.created_at.toISOString()
    , updatedAt = row.updated_at.toISOString()
    , revision = slugid.encode(row.revision.toString());

  return new Article(
    id, name, linkName, imageUrl, content,
    published, publishedAt,
    creator, createdAt, updatedAt, revision
  );
}
