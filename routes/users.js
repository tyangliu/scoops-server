'use strict';

let restify = require('restify')
  , UsersController = require('../controllers/users/UsersController');

function usersRoutes(server) {
  let controller = new UsersController()
    , path = '/users'
    , mePath = `${path}/me`
    , idPath = `${path}/:userId`;

  server.get({path, version: '1.0.0'}, controller.getUsers);
  server.post({path, version: '1.0.0'}, controller.postUsers);

  server.get({path: mePath, version: '1.0.0'}, controller.getCurrentUser);

  server.get({path: idPath, version: '1.0.0'}, controller.getUserById);
  server.del({path: idPath, version: '1.0.0'}, controller.deleteUserById);
  server.patch({path: idPath, version: '1.0.0'}, controller.patchUserById);
  server.put({path: idPath, version: '1.0.0'}, controller.putUserById);

  return server;
}

module.exports = usersRoutes;
