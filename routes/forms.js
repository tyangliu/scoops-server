'use strict';

let restify = require('restify')
  , _ = require('lodash')
  , FormsController = require('../controllers/forms/FormsController')
  , SubmissionsController = require('../controllers/forms/SubmissionsController');

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

function submissionsRoutes(server) {
  let controller = new SubmissionsController()
    , path = '/forms/:formId/submissions'
    , idPath = `${path}/:subId`;

  server.get({path, version: '1.0.0'}, controller.getSubmissions);
  server.post({path, version: '1.0.0'}, controller.postSubmissions);

  server.get({path: idPath, version: '1.0.0'}, controller.getSubmissionById);
  server.del({path: idPath, version: '1.0.0'}, controller.deleteSubmissionById);
  server.patch({path: idPath, version: '1.0.0'}, controller.patchSubmissionById);
  server.put({path: idPath, version: '1.0.0'}, controller.putSubmissionsById);

  return server;
}

module.exports = _.flow(formsRoutes, submissionsRoutes);
