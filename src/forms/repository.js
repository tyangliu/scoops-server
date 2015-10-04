'use strict';

let db = require('../db/dbClient')()
  , cassandra = require('cassandra-driver')
  , slugid = require('slugid')
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

function create(
  name, description, expiresAt,
  accessGroups, accessUsers, createdBy,
  questions
) {
  let promise = new Promise((resolve, reject) => async.waterfall([
    // (1) build question models
    (callback) => {
      questions = questions || [];
      questions = questions.map(question => new Question(
        cassandra.types.TimeUuid.now(), // questionId
        question.type,
        question.label,
        question.description,
        question.choices
      ));

      callback(null, questions);
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
        (new Date()).toISOString(), // createdAt
        slugid.decode(createdBy), // createdBy
        null, // lastModifiedAt
        null, // lastModifiedBy
        cassandra.types.TimeUuid.now(), // revisionId
        questions
      );

      callback(null, form);
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
          (?,?,?,?,?,?,?,?,?,?,?,?);
      `;

      db.execute(query, [
        form.formId, form.name, form.description, form.expiresAt,
        form.accessGroups, form.accessUsers,
        form.createdAt, form.createdBy,
        form.lastModifiedAt, form.lastModifiedBy, form.revisionId,
        form.questions
      ], { prepare: true }, (err, result) =>
        callback(err, form)
      );
    },
    // (4) persist to forms_by_creator table
    (form, callback) => {
      let query = `
        INSERT INTO forms_by_creator (
          created_by, form_id, name, description, expires_at,
          access_groups, access_users,
          created_at,
          last_modified_at, last_modified_by, revision_id,
          questions)
        VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?);
      `;

      db.execute(query, [
        form.createdBy, form.formId, form.name, form.description, form.expiresAt,
        form.accessGroups, form.accessUsers,
        form.createdAt,
        form.lastModifiedAt, form.lastModifiedBy, form.revisionId,
        form.questions
      ], { prepare: true }, (err, result) =>
        callback(err, form)
      );
    },
    // (5) normalize fields
    (form, callback) => {
      form.formId = slugid.encode(form.formId.toString());
      form.createdBy = slugid.encode(form.createdBy.toString());
      form.revisionId = slugid.encode(form.revisionId.toString());
      form.questions.forEach(question => {
        question.questionId = slugid.encode(question.questionId.toString());
      });
      callback(null, form);
    }
    // (6) resolve/reject promise
  ], (err, form) => err ? reject(err) : resolve(form)));

  return promise;
}

function findById(formId) {
  let promise = new Promise((resolve, reject) => {
    let query = `SELECT * FROM forms WHERE form_id = ?`;

    formId = slugid.decode(formId);

    db.execute(query, [formId], { prepare: true }, (err, result) => {
      if (err) { reject(err); }
      if (result.rows.length <= 0) { resolve(null); }

      let row = result.rows[0];
      let form = new Form(
        slugid.encode(row.form_id.toString()),
        row.name,
        row.description,
        row.expires_at ? row.expires_at.toISOString() : null,
        row.access_groups,
        row.access_users.map(userId => slugid.encode(userId.toString())),
        row.created_at.toISOString(),
        slugid.encode(row.created_by.toString()),
        row.last_modified_at ? row.last_modified_at.toISOString() : null,
        row.last_modified_by ? slugid.encode(row.last_modified_by.toString()) : null,
        slugid.encode(row.revision_id.toString()),
        row.questions.map(question => new Question(
          slugid.encode(question.question_id.toString()),
          question.type,
          question.label,
          question.description,
          question.choices
        ))
      );

      resolve(form);
    })
  });

  return promise;
}

function findByCreator(createdBy) {
  let promise = new Promise((resolve, reject) => {
    let query = `SELECT * FROM forms_by_creator WHERE created_by = ?`;

    createdBy = slugid.decode(createdBy);

    db.execute(query, [createdBy], { prepare: true }, (err, result) => {
      if (err) { reject(err); }
      if (result.rows.length <= 0) { resolve(null); }

      let row = result.rows[0];
      let form = new Form(
        slugid.encode(row.form_id.toString()),
        row.name,
        row.description,
        row.expires_at ? row.expires_at.toISOString() : null,
        row.access_groups,
        row.access_users.map(userId => slugid.encode(userId.toString())),
        row.created_at.toISOString(),
        slugid.encode(row.created_by.toString()),
        row.last_modified_at ? row.last_modified_at.toISOString() : null,
        row.last_modified_by ? slugid.encode(row.last_modified_by.toString()) : null,
        slugid.encode(row.revision_id.toString()),
        row.questions.map(question => new Question(
          slugid.encode(question.question_id.toString()),
          question.type,
          question.label,
          question.description,
          question.choices
        ))
      );

      resolve(form);
    })
  });

  return promise;
}

module.exports = {
  create,
  findById,
  findByCreator
};
