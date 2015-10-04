'use strict';

let Joi = require('Joi')
  , JoiPatterns = require('../utils/JoiPatterns')
  , handlers = require('./handlers');

function usersRoutes(server) {
  server.get({
    path: '/users',
    version: '1.0.0'
  }, handlers.getUsers);

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
  }, handlers.postUsers);

  server.get({
    path: '/users/me',
    version: '1.0.0'
  }, handlers.getCurrentUser);

  server.get({
    path: '/users/:userId',
    version: '1.0.0',
    validation: {
      params: {
        userId: JoiPatterns.base64Uuid.required()
      }
    }
  }, handlers.getUserById);

  server.del({
    path: '/users/:userId',
    version: '1.0.0',
    validation: {
      params: {
        userId: JoiPatterns.base64Uuid.required()
      }
    }
  }, handlers.deleteUserById);

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
  }, handlers.patchUserById);

  server.put({
    path: '/users/:userId',
    version: '1.0.0',
    validation: {
      params: {
        userId: JoiPatterns.base64Uuid.required()
      }
    }
  }, handlers.putUserById);

  return server;
}

module.exports = usersRoutes;
