'use strict';

let restify = require('restify')
  , passport = require('passport')
  , validator = require('restify-joi-middleware')
  , Joi = require('Joi')
  , JoiPatterns = require('../utils/JoiPatterns')
  , handlers = require('./handlers');

module.exports = function(server) {
  server.get({
    path: '/users',
    version: '1.0.0'
  },
    passport.authenticate('bearer', { session: false }),
    handlers.getUsers
  );

  server.post({
    path: '/users',
    version: '1.0.0',
    validation: {
      body: {
        email: JoiPatterns.email.required(),
        password: JoiPatterns.password.required(),
        name: JoiPatterns.shortString.required(),
        voucher: JoiPatterns.base64Uuid
      }
    }
  },
    restify.bodyParser(),
    validator(),
    handlers.postUsers
  );

  server.get({
    path: '/users/me',
    version: '1.0.0'
  },
    passport.authenticate('bearer', { session: false }),
    handlers.getCurrentUser
  );

  server.get({
    path: '/users/:userId',
    version: '1.0.0',
    validation: {
      params: {
        userId: JoiPatterns.base64Uuid.required()
      }
    }
  },
    passport.authenticate('bearer', { session: false }),
    validator(),
    handlers.getUserById
  );

  server.del({
    path: '/users/:userId',
    version: '1.0.0',
    validation: {
      params: {
        userId: JoiPatterns.base64Uuid.required()
      }
    }
  },
    passport.authenticate('bearer', { session: false }),
    validator(),
    handlers.deleteUserById
  );

  server.patch({
    path: '/users/:userId',
    version: '1.0.0',
    validation: {
      params: {
        userId: JoiPatterns.base64Uuid.required()
      },
      body: {
        password: JoiPatterns.password,
        name: JoiPatterns.shortString,
        groups: Joi.array().items(Joi.string().valid(
          'SUPER', 'ADMIN', 'WRITER'
        ))
      }
    }
  },
    passport.authenticate('bearer', { session: false }),
    restify.bodyParser(),
    validator(),
    handlers.patchUserById
  );

  server.put({
    path: '/users/:userId',
    version: '1.0.0',
    validation: {
      params: {
        userId: JoiPatterns.base64Uuid.required()
      }
    }
  },
    passport.authenticate('bearer', { session: false }),
    validator(),
    handlers.putUserById
  );

  return server;
}
