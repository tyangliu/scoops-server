'use strict';

let Promise = require('bluebird')
  , restify = require('restify')
  , humps = require('humps')
  , fs = require('fs')
  , mime = require('mime')
  , config = require('../config')
  , UserSummary = require('../users/repository').UserSummary
  , repository = require('./repository');

let getArticles = function() {

};

let postArticles = Promise.coroutine(function *(req, res) {
  req.body = humps.camelizeKeys(req.body);

  let name = req.body.name
    , linkName = req.body.linkName
    , content = req.body.content
    , published = req.body.published
    , publishedAt = req.body.publishedAt
    , creator = new UserSummary(
      req.user.id,
      req.user.email,
      req.user.name
    );

  try {
    let article = yield repository.create(
      name, linkName, content, published, publishedAt, creator
    );
    if (article) {
      article = humps.decamelizeKeys(article);
    }
    res.send(201, article);
  } catch (err) {
    res.send(err);
  }
});

let getArticleById = Promise.coroutine(function *(req, res) {
  let articleId = req.params.articleId
    , article = yield repository.findById(articleId)

  if (article) {
    article = humps.decamelizeKeys(article);
    return res.send(article);
  }

  let err = new restify.NotFoundError(`Article with id ${articleId} does not exist.`);
  return res.send(err);
});

let deleteArticleById = function(req, res) {

};

let patchArticleById = Promise.coroutine(function *(req, res) {
  req.body = humps.camelizeKeys(req.body);

  let articleId = req.params.articleId
    , fields = req.body;

  try {
    let article = yield repository.update(articleId, fields);
    if (article) {
      article = humps.decamelizeKeys(article);
    }
    res.send(200, article);
  } catch (err) {
    res.send(err);
  }
});

let putArticleById = function(req, res) {

};

let putArticleImageById = Promise.coroutine(function *(req, res) {
  try {
    let articleId = req.params.articleId
      , article = yield repository.findById(articleId)
      , ext = mime.extension(req.headers['content-type'])
      , path = config.uploads.articlesPath + articleId + '.' + ext
      , writeStream = fs.createWriteStream(path);

    if (article) {
      yield repository.update(articleId, {imageUrl: path});
      req.pipe(writeStream);
      req.on('end', () => res.send(200));
    } else {
      throw new restify.NotFoundError(`Article with id ${articleId} does not exist.`);
    }
  } catch (err) {
    res.send(err);
  }
});


module.exports = {
  getArticles,
  postArticles,
  getArticleById,
  deleteArticleById,
  patchArticleById,
  putArticleById,
  putArticleImageById
};
