'use strict';

let Promise = require('bluebird')
  , restify = require('restify')
  , humps = require('humps')
  , repository = require('./repository');

let getUsers = function(req, res) {
  res.send('getUsers unimplemented');
};

let postUsers = Promise.coroutine(function *(req, res) {
  let email = req.body.email
    , password = req.body.password
    , name = req.body.name
    , voucher = req.body.voucher;

  try {
    let user = yield repository.create(email, password, name, voucher);
    if (user) {
      delete user.hashedPassword;
      user = humps.decamelizeKeys(user);
    }
    res.send(user);
  } catch (err) {
    res.send(err);
  }
});

let getUserById = Promise.coroutine(function *(req, res) {
  let userId = req.params.userId
    , user = yield repository.findById(userId)

  if (user) {
    delete user.hashedPassword;
    user = humps.decamelizeKeys(user);
    return res.send(user);
  }

  let err = new restify.NotFoundError(`User with id ${userId} does not exist.`);
  return res.send(err);
});

let getCurrentUser = function(req, res) {
  res.send('getCurrentUser unimplemented');
};

let deleteUserById = function(req, res) {
  res.send('deleteUserById unimplemented');
};

let patchUserById = function(req, res) {
  res.send('patchUserById unimplemented');
};

let putUserById = function(req, res) {
  res.send('putUserById unimplemented');
};

module.exports = {
  getUsers,
  postUsers,
  getUserById,
  getCurrentUser,
  deleteUserById,
  patchUserById,
  putUserById
};
