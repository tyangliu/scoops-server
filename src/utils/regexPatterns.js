'use strict';

let patterns = {
  password: /^[a-zA-Z0-9]{3,30}$/,
  base64Uuid: /^[A-Za-z0-9_-]{22}$/,
  imageMimeType: /^image\/(jpeg|png|svg\+xml|gif)$/
};

module.exports = patterns;
