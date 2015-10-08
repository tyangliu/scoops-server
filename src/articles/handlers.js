'use strict';

let Promise = require('bluebird')
  , humps = require('humps')
  , UserSummary = require('../users/repository').UserSummary
  , repository = require('./repository');

let getArticles = function() {

};

let postArticles = Promise.coroutine(function *(req, res) {
  let name = req.body.name
    , linkName = req.body.linkName
    , content = req.body.content
    , published = req.body.published
    , creator = new UserSummary(
      req.user.id,
      req.user.email,
      req.user.name
    );

  try {
    let article = yield repository.create(
      name, linkName, content, published, creator
    );
    if (article) {
      article = humps.decamelizeKeys(article);
    }
    res.send(article);
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

  let err = new restify.NotFoundError(`Article id ${articleId} does not exist.`);
  return res.send(err);
});

let deleteArticleById = function(req, res) {

};

let patchArticleById = function(req, res) {

};

let putArticleById = function(req, res) {

};

module.exports = {
  getArticles,
  postArticles,
  getArticleById,
  deleteArticleById,
  patchArticleById,
  putArticleById
};
