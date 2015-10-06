'use strict';

let Joi = require('Joi')
  , JoiPatterns = require('../utils/JoiPatterns')
  , passport = require('passport')
  , handlers = require('./handlers');

function usersRoutes(server) {
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
  }, handlers.postUsers);

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
    handlers.putUserById
  );

  return server;
}

module.exports = usersRoutes;
