'use strict';

let restify = require('restify')
  , passport = require('passport')
  , validator = require('restify-joi-middleware')
  , Joi = require('Joi')
  , JoiPatterns = require('../utils/JoiPatterns')
  , handlers = require('./handlers');

module.exports = function(server) {
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
        link_name: JoiPatterns.shortString.required(),
        content: Joi.string().required(),
        published: Joi.boolean(),
        published_at: Joi.string().isoDate()
      }
    }
  },
    passport.authenticate('bearer', { session: false }),
    restify.bodyParser(),
    validator(),
    handlers.postArticles
  );

  server.get({
    path: '/articles/:articleId',
    version: '1.0.0',
    validation: {
      params: {
        articleId: JoiPatterns.base64Uuid.required()
      }
    }
  },
    validator(),
    handlers.getArticleById
  );

  server.del({
    path: '/articles/:articleId',
    version: '1.0.0',
    validation: {
      params: {
        articleId: JoiPatterns.base64Uuid.required()
      }
    }
  },
    passport.authenticate('bearer', { session: false }),
    validator(),
    handlers.deleteArticleById
  );

  server.patch({
    path: '/articles/:articleId',
    version: '1.0.0',
    validation: {
      params: {
        articleId: JoiPatterns.base64Uuid.required()
      },
      body: {
        name: JoiPatterns.shortString,
        content: Joi.string(),
        published: Joi.boolean()
      }
    }
  },
    passport.authenticate('bearer', { session: false }),
    restify.bodyParser(),
    validator(),
    handlers.patchArticleById
  );

  server.put({
    path: '/articles/:articleId',
    version: '1.0.0',
    validation: {
      params: {
        articleId: JoiPatterns.base64Uuid.required()
      }
    }
  },
    passport.authenticate('bearer', { session: false }),
    validator(),
    handlers.putArticleById
  );

  server.put({
    path: '/articles/:articleId/image',
    version: '1.0.0',
    validation: {
      params: {
        articleId: JoiPatterns.base64Uuid.required()
      },
      headers: {
        'content-type': JoiPatterns.imageMimeType.required()
      }
    }
  },
    passport.authenticate('bearer', { session: false }),
    validator(),
    handlers.putArticleImageById
  );

  return server;
}
