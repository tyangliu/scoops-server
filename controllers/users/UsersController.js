'use strict';

let restify = require('restify')
  , repository = require('../../repositories/usersRepository');

class UsersController {

  getUsers(req, res) {
    res.send('getUsers unimplemented');
  }

  postUsers(req, res) {
    let email = req.body.email
      , password = req.body.password
      , name = req.body.name
      , voucher = req.body.voucher;

    repository.create(email, password, name, voucher)
      .then(user => {
        user && (delete user.hashedPassword);
        res.send(user);
      })
      .catch(err => res.send(err));
  }

  getUserById(req, res) {
    let userId = req.params.userId;

    repository.findById(userId).then(user => {
      user || res.send(
        new restify.NotFoundError(`User with id ${userId} does not exist.`)
      );
      delete user.hashedPassword;
      res.send(user);
    });
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
