'use strict';

let repository = require('./repository');

function getForms(req, res) {
  res.send('getForms unimplemented');
}

function postForms(req, res) {
  let name = req.body.name
    , description = req.body.description
    , expiresAt = req.body.expiresAt
    , accessGroups = req.body.accessGroups
    , accessUsers = req.body.accessUsers
    , createdBy = req.body.createdBy
    , questions = req.body.questions;

  repository.create(
    name,
    description,
    expiresAt,
    accessGroups,
    accessUsers,
    createdBy,
    questions
  )
    .then(form => {
      res.send(form);
    })
    .catch(err => res.send(err));
}

function getFormById(req, res) {
  res.send('getFormById unimplemented');
}

function deleteFormById(req, res) {
  res.send('deleteFormById unimplemented');
}

function patchFormById(req, res) {
  res.send('patchFormById unimplemented');
}

function putFormById(req, res) {
  res.send('putFormById unimplemented');
}

module.exports = {
  getForms,
  postForms,
  getFormById,
  deleteFormById,
  patchFormById,
  putFormById
};
