'use strict';

let _ = require('lodash')
  , Joi = require('joi')
  , JoiPatterns = require('../utils/JoiPatterns')
  , formsController = require('../controllers/FormsController')
  , responsesController = require('../controllers/ResponsesController');

function formsRoutes(server) {
  server.get({
    path: '/forms',
    version: '1.0.0'
  }, formsController.getForms);

  server.post({
    path: '/forms',
    version: '1.0.0',
    validation: {
      body: {
        name: JoiPatterns.shortString.required(),
        description: JoiPatterns.shortString.required(),
        expiresAt: Joi.string().isoDate(),
        accessGroups: Joi.array().items(Joi.string().valid(
          'SUPER', 'ADMIN', 'WRITER'
        )),
        accessUsers: Joi.array().items(JoiPatterns.base64Uuid),
        createdBy: JoiPatterns.base64Uuid.required(),
        questions: Joi.array().items(Joi.object().keys({
          type: JoiPatterns.shortString.required(),
          label: JoiPatterns.shortString.required(),
          description: JoiPatterns.shortString,
          choices: Joi.array().items(JoiPatterns.shortString)
        }))
      }
    }
  }, formsController.postForms);

  server.get({
    path: '/forms/:formId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required()
      }
    }
  }, formsController.getFormById);

  server.del({
    path: '/forms/:formId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required()
      }
    }
  }, formsController.deleteFormById);

  server.patch({
    path: '/forms/:formId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required()
      }
    }
  }, formsController.patchFormById);

  server.put({
    path: '/forms/:formId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required()
      }
    }
  }, formsController.putFormById);

  return server;
}

function responsesRoutes(server) {
  server.get({
    path: '/forms/:formId/responses',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required()
      }
    }
  }, responsesController.getResponses);

  server.post({
    path: '/forms/:formId/responses',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required()
      }
    }
  }, responsesController.postResponses);

  server.get({
    path: '/forms/:formId/submissions/:submissionId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required(),
        responseId: JoiPatterns.base64Uuid.required()
      }
    }
  }, responsesController.getResponseById);

  server.del({
    path: '/forms/:formId/responses/:responseId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required(),
        responseId: JoiPatterns.base64Uuid.required()
      }
    }
  }, responsesController.deleteResponseById);

  server.patch({
    path: '/forms/:formId/responses/:responseId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required(),
        responseId: JoiPatterns.base64Uuid.required()
      }
    }
  }, responsesController.patchResponseById);

  server.put({
    path: '/forms/:formId/responses/:responseId',
    version: '1.0.0',
    validation: {
      params: {
        formId: JoiPatterns.base64Uuid.required(),
        responseId: JoiPatterns.base64Uuid.required()
      }
    }
  }, responsesController.putResponseById);

  return server;
}

module.exports = _.flow(formsRoutes, responsesRoutes);
