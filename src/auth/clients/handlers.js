'use strict';

let Promise = require('bluebird')
  , humps = require('humps')
  , repository = require('./repository')
  , UserSummary = require('../../users/repository').UserSummary;

let postClients = Promise.coroutine(function *(req, res) {
  let creator = new UserSummary(
    req.user.id,
    req.user.email,
    req.user.name
  );

  try {
    let client = yield repository.create(creator);
    if (client) {
      client = humps.decamelizeKeys(client);
    }
    res.send(client);
  } catch (err) {
    res.send(err);
  }
});

module.exports = {
  postClients
};
