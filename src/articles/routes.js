'use strict';

let Joi = require('Joi')
  , JoiPatterns = require('../utils/JoiPatterns')
  , handlers = require('./handlers');

function articlesRoutes(server) {
  server.get({
    path: '/articles',
    version: '1.0.0'
  }, handlers.getArticles);

  server.post({
    path: '/articles',
    version: '1.0.0',
    validation: {
      body: {
        name: JoiPatterns.shortString.required(),
        linkName: JoiPatterns.shortString.required(),
        content: Joi.string().required(),
        published: Joi.boolean()
      }
    }
  }, handlers.postArticles);

  server.get({
    path: '/articles/:articleId',
    version: '1.0.0',
    validation: {
      params: {
        articleId: JoiPatterns.base64Uuid.required()
      }
    }
  }, handlers.getArticleById);

  server.del({
    path: '/articles/:articleId',
    version: '1.0.0',
    validation: {
      params: {
        articleId: JoiPatterns.base64Uuid.required()
      }
    }
  }, handlers.deleteArticleById);

  server.patch({
    path: '/articles/:articleId',
    version: '1.0.0',
    validation: {
      params: {
        articleId: JoiPatterns.base64Uuid.required()
      },
      body: {

      }
    }
  }, handlers.patchArticleById);

  server.put({
    path: '/articles/:articleId',
    version: '1.0.0',
    validation: {
      params: {
        articleId: JoiPatterns.base64Uuid.required()
      }
    }
  }, handlers.putArticleById);

  return server;
}

module.exports = articlesRoutes;