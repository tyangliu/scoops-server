'use strict';

let restify = require('restify')
  , _ = require('lodash')
  , FormsController = require('../controllers/forms/FormsController')
  , ResponsesController = require('../controllers/forms/ResponsesController');

function formsRoutes(server) {
  let controller = new FormsController()
    , path = '/forms'
    , idPath = `${path}/:formId`;

  server.get({path, version: '1.0.0'}, controller.getForms);
  server.post({path, version: '1.0.0'}, controller.postForms);

  server.get({path: idPath, version: '1.0.0'}, controller.getFormById);
  server.del({path: idPath, version: '1.0.0'}, controller.deleteFormById);
  server.patch({path: idPath, version: '1.0.0'}, controller.patchFormById);
  server.put({path: idPath, version: '1.0.0'}, controller.putFormById);

  return server;
}

function responsesRoutes(server) {
  let controller = new ResponsesController()
    , path = '/forms/:formId/submissions'
    , idPath = `${path}/:submissionId`;

  server.get({path, version: '1.0.0'}, controller.getResponses);
  server.post({path, version: '1.0.0'}, controller.postResponses);

  server.get({path: idPath, version: '1.0.0'}, controller.getResponseById);
  server.del({path: idPath, version: '1.0.0'}, controller.deleteResponseById);
  server.patch({path: idPath, version: '1.0.0'}, controller.patchResponseById);
  server.put({path: idPath, version: '1.0.0'}, controller.putResponsesById);

  return server;
}

module.exports = _.flow(formsRoutes, responsesRoutes);
