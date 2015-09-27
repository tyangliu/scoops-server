'use strict';

let restify = require('restify')
  , Joi = require('Joi')
  , JoiPatterns = require('../utils/JoiPatterns')
  , UsersController = require('../controllers/users/UsersController');

function usersRoutes(server) {
  let controller = new UsersController();

  server.get({
    path: '/users',
    version: '1.0.0'
  }, controller.getUsers);

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
  }, controller.postUsers);

  server.get({
    path: '/users/me',
    version: '1.0.0'
  }, controller.getCurrentUser);

  server.get({
    path: '/users/:userId',
    version: '1.0.0',
    validation: {
      params: {
        userId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.getUserById);

  server.del({
    path: '/users/:userId',
    version: '1.0.0',
    validation: {
      params: {
        userId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.deleteUserById);

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
  }, controller.patchUserById);

  server.put({
    path: '/users/:userId',
    version: '1.0.0',
    validation: {
      params: {
        userId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.putUserById);

  return server;
}

module.exports = usersRoutes;
