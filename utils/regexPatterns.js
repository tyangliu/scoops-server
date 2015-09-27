'use strict';

let patterns = {
  password: /^[a-zA-Z0-9]{3,30}$/,
  uuidBase64: /^[A-Za-z0-9_-]{22}$/
};

module.exports = patterns;
