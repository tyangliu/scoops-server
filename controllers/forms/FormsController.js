'use strict';

let FormsRepository = require('../../repositories/FormsRepository')
  , repository = new FormsRepository();

class FormsController {

  getForms(req, res) {
    res.send('getForms unimplemented');
  }

  postForms(req, res) {
    let name = req.body.name
      , description = req.body.description
      , expiresAt = req.body.expiresAt
      , accessGroups = req.body.accessGroups
      , accessUsers = req.body.accessUsers
      , createdBy = req.body.createdBy
      , questions = req.body.questions;

    repository.createForm(
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

  getFormById(req, res) {
    res.send('getFormById unimplemented');
  }

  deleteFormById(req, res) {
    res.send('deleteFormById unimplemented');
  }

  patchFormById(req, res) {
    res.send('patchFormById unimplemented');
  }

  putFormById(req, res) {
    res.send('putFormById unimplemented');
  }

}

module.exports = FormsController;
