'use strict';

let db = require('../db/dbClient')()
  , cassandra = require('cassandra-driver')
  , async = require('async')
  , slugid = require('slugid');

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

  }

}
