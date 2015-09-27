'use strict';

let restify = require('restify')
  , _ = require('lodash')
  , Joi = require('joi')
  , JoiPatterns = require('../utils/JoiPatterns')
  , FormsController = require('../controllers/forms/FormsController')
  , ResponsesController = require('../controllers/forms/ResponsesController');

function formsRoutes(server) {
  let controller = new FormsController();

  server.get({
    path: '/forms',
    version: '1.0.0'
  }, controller.getForms);

  server.post({
    path: '/forms',
    version: '1.0.0'
  }, controller.postForms);

  server.get({
    path: '/forms/:formId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.getFormById);

  server.del({
    path: '/forms/:formId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.deleteFormById);

  server.patch({
    path: '/forms/:formId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.patchFormById);

  server.put({
    path: '/forms/:formId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.putFormById);

  return server;
}

function responsesRoutes(server) {
  let controller = new ResponsesController();

  server.get({
    path: '/forms/:formId/submissions',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.getResponses);

  server.post({
    path: '/forms/:formId/submissions',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.postResponses);

  server.get({
    path: '/forms/:formId/submissions/:submissionId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required(),
        submissionId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.getResponseById);

  server.del({
    path: '/forms/:formId/submissions/:submissionId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required(),
        submissionId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.deleteResponseById);

  server.patch({
    path: '/forms/:formId/submissions/:submissionId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required(),
        submissionId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.patchResponseById);

  server.put({
    path: '/forms/:formId/submissions/:submissionId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required(),
        submissionId: JoiPatterns.base64Uuid.required()
      }
    }
  }, controller.putResponsesById);

  return server;
}

module.exports = _.flow(formsRoutes, responsesRoutes);
