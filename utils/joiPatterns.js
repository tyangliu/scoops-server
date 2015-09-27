'use strict';

let Joi = require('joi')
  , regex = require('./regexPatterns');

let patterns = {
  shortString: Joi.string().alphanum().min(2).max(255),
  email: Joi.string().email(),
  password: Joi.string().regex(regex.password),
  base64Uuid: Joi.string().regex(regex.uuidBase64)
};

module.exports = patterns;
