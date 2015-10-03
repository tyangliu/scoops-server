'use strict';

let restify = require('restify')
  , Joi = require('Joi')
  , JoiPatterns = require('../utils/JoiPatterns')
  , ArticlesController = require('../controllers/articles/ArticlesController');;

function articlesRoutes(server) {
  let controller = new ArticlesController();

  server.get({
    path: '/articles',
    version: '1.0.0'
  }, controller.getArticles);

  server.post({
    path: '/articles',
    version: '1.0.0',
    validation: {
      body: {
        name: JoiPatterns.shortString.required(),
        linkName: JoiPatterns.shortString.required(),
        // object with base64 encoded binary data and file type
        image: JoiPatterns.file,
        content: Joi.string().required(),
        published: Joi.boolean(),
        creator: JoiPatterns.userSummary.required()
      }
    }
  }, controller.postArticles);

  server.get({
    path: '/articles/:articleId',
    version: '1.0.0',
    validation: {
      params: {
        articleId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.getArticleById);

  server.del({
    path: '/articles/:articleId',
    version: '1.0.0',
    validation: {
      params: {
        articleId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.deleteArticleById);

  server.patch({
    path: '/articles/:articleId',
    version: '1.0.0',
    validation: {

    }
  }, controller.patchArticleById);

  server.put({
    path: '/articles/:articleId',
    version: '1.0.0',
    validation: {

    }
  }, controller.putArticleById);

  return server;
}

module.exports = articlesRoutes;
