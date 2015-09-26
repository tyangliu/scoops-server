'use strict';

let restify = require('restify')
  , _ = require('lodash')
  , FormsController = require('../controllers/forms/FormsController')
  , SubmissionsController = require('../controllers/forms/SubmissionsController');

function formsRoutes(server) {
  let formsController = new FormsController();

  server.get(
    {path: '/forms', version: '1.0.0'},
    formsController.getForms
  );
  server.post(
    {path: '/forms', version: '1.0.0'},
    formsController.postForms
  );

  server.get(
    {path: '/forms/:formId', version: '1.0.0'},
    formsController.getFormById
  );
  server.del(
    {path: '/forms/:formId', version: '1.0.0'},
    formsController.deleteFormById
  );
  server.patch(
    {path: '/forms/:formId', version: '1.0.0'},
    formsController.patchFormById
  );
  server.put(
    {path: '/forms/:formId', version: '1.0.0'},
    formsController.putFormById
  );

  return server;
}

function submissionsRoutes(server) {
  let submissionsController = new SubmissionsController();

  server.get(
    {path: '/forms/:formId/submissions', version: '1.0.0'},
    submissionsController.getSubmissions
  );
  server.post(
    {path: '/forms/:formId/submissions', version: '1.0.0'},
    submissionsController.postSubmissions
  );

  server.get(
    {path: '/forms/:formId/submissions/:subId', version: '1.0.0'},
    submissionsController.getSubmissionById
  );
  server.del(
    {path: '/forms/:formId/submissions/:subId', version: '1.0.0'},
    submissionsController.deleteSubmissionById
  );
  server.patch(
    {path: '/forms/:formId/submissions/:subId', version: '1.0.0'},
    submissionsController.patchSubmissionById
  );
  server.patch(
    {path: '/forms/:formId/submissions/:subId', version: '1.0.0'},
    submissionsController.putSubmissionsById
  );

  return server;
}

module.exports = _.flow(formsRoutes, submissionsRoutes);
