'use strict';

let Joi = require('joi');

class UsersController {

  getUsers(req, res) {
    res.send('getUsers unimplemented');
  }

  postUsers(req, res) {
    let bodySchema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
      name: Joi.string().alphanum().min(2).max(255).required(),
      voucher: Joi.string().guid()
    });

    let err = bodySchema.validate(req.body);
    if (err) return next(err);

    // prepare to persist user
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
