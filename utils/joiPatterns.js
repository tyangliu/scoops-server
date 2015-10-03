'use strict';

let Joi = require('joi')
  , regex = require('./regexPatterns');

let patterns = {
  shortString: Joi.string().min(2).max(255),
  email: Joi.string().email(),
  password: Joi.string().regex(regex.password),
  base64Uuid: Joi.string().regex(regex.base64Uuid),

  userSummary: Joi.object().keys({
    id: Joi.string().regex(regex.base64Uuid),
    email: Joi.string().email(),
    name: Joi.string().min(2).max(255)
  }),

  file: Joi.object().keys({
    type: Joi.string().min(2).max(255),
    data: Joi.binary().encoding('base64')
  })
};

module.exports = patterns;
