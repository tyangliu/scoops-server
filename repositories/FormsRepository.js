'use strict';

let db = require('../db/dbClient')()
  , cassandra = require('cassandra-driver')
  , async = require('async');

class Question {

  constructor(questionId, type, label, description, choices) {
    this.questionId = questionId;
    this.type = type;
    this.label = label;
    this.description = description;
    this.choices = choices;
  }

}

class Form {

  constructor(
    formId, name, description, expiresAt,
    accessGroups, accessUsers,
    createdAt, createdBy,
    lastModifiedAt, lastModifiedBy, revisionId,
    questions
  ) {
    this.formId = formId;
    this.name = name;
    this.description = description;
    this.expiresAt = expiresAt;
    this.accessGroups = accessGroups;
    this.accessUsers = accessUsers;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.lastModifiedAt = lastModifiedAt;
    this.lastModifiedBy = lastModifiedBy;
    this.revisionId = revisionId;
    this.questions = questions;
  }

}

class FormsRepository {

  constructor() { this.db = db; }

  createForm(
    name, description, expiresAt,
    accessGroups, accessUsers, createdBy,
    questions
  ) {
    let promise = new Promise((resolve, reject) => async.waterfall([
      // (1) build question models
      (callback) => {
        let questions = questions.map(question =>
          new Question(
            cassandra.types.TimeUuid.now(), // questionId
            question.type,
            question.label,
            question.description,
            question.choices
          )
        );

        callback(questions);
      },
      // (2) build form model
      (questions, callback) => {
        let form = new Form(
          cassandra.types.TimeUuid.now(), // formId
          name,
          description,
          expiresAt,
          accessGroups || [], // accessGroups
          accessUsers || [], // accessUsers
          Date.now().toISOString(), // createdAt
          createdBy, // createdBy
          null, // lastModifiedAt
          null, // lastModifiedBy
          cassandra.types.TimeUuid.now(), // revisionId
          questions
        );

        callback(form);
      },
      // (3) persist to forms table
      (form, callback) => {
        let query = `
          INSERT INTO forms (
            form_id, name, description, expires_at,
            access_groups, access_users,
            created_at, created_by,
            last_modified_at, last_modified_by, revision_id,
            questions)
          VALUES
            (?,?,?,?,?,?,?,?,?,?,?,?)
          IF NOT EXISTS;
        `;

        this.db.execute(query, [
          form.formId, form.name, form.description, form.expiresAt,
          form.accessGroups, form.accessUsers,
          form.createdAt, form.createdBy,
          form.lastModifiedAt, form.lastModifiedBy, form.revisionId,
          form.questions
        ], { prepare: true }, (err, result) =>
          callback(err, form)
        );
      },
      (form, callback) => {
        let query = `
          INSERT INTO forms_by_creator (
            created_by, form_id, name, description, expires_at,
            access_groups, access_users,
            created_at,
            last_modified_at, last_modified_by, revision_id,
            questions)
          VALUES
            (?,?,?,?,?,?,?,?,?,?,?,?)
          IF NOT EXISTS;
        `;

        this.db.execute(query, [
          form.createdBy, form.formId, form.name, form.description, form.expiresAt,
          form.accessGroups, form.accessUsers,
          form.createdAt,
          form.lastModifiedAt, form.lastModifiedBy, form.revisionId,
          form.questions
        ], { prepare: true }, (err, result) =>
          callback(err, form)
        );
      }
      // (5) resolve/reject promise
    ], (err, form) => err ? reject(err) : resolve(form)));

    return promise;
  }

  findFormById(formId) {

  }

  findFormByCreator(createdBy) {

  }

}

module.exports = FormsRepository;
