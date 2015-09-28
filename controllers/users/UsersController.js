'use strict';

let UsersRepository = require('../../repositories/UsersRepository');

class UsersController {

  constructor() {
    this.repository = new UsersRepository();
  }

  getUsers(req, res) {
    res.send('getUsers unimplemented');
  }

  postUsers(req, res) {
    res.send('postUsers unimplemented');
  }

  getUserById(req, res) {
    res.send('getUserById unimplemented');
  }

  getCurrentUser(req, res) {
    res.send('getCurrentUser unimplemented');
  }

  deleteUserById(req, res) {
    res.send('deleteUserById unimplemented');
  }

  patchUserById(req, res) {
    res.send('patchUserById unimplemented');
  }

  putUserById(req, res) {
    res.send('putUserById unimplemented');
  }

}

module.exports = UsersController;
