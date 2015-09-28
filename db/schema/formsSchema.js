'use strict';

let queries = [
  // forms
  `
    CREATE TABLE IF NOT EXISTS forms (
      form_id timeuuid,

      name text,
      description text,
      expires_at timestamp,

      access_groups set<text>,
      access_users set<uuid>,

      created_at timestamp,
      created_by uuid,

      last_modified_at timestamp,
      last_modified_by uuid,
      revision_id timeuuid,

      PRIMARY KEY (form_id)
    );
  `,
  // forms_by_creator
  `
    CREATE TABLE IF NOT EXISTS forms_by_creator (
      created_by uuid,
      form_id timeuuid,

      name text,
      description text,
      expires_at timestamp,

      access_groups set<text>,
      access_users set<uuid>,

      created_at timestamp,

      last_modified_at timestamp,
      last_modified_by uuid,
      revision_id timeuuid,

      PRIMARY KEY (created_by, form_id)
    );
  `,
  // form_questions
  `
    CREATE TABLE IF NOT EXISTS form_questions (
      form_id timeuuid,
      question_id timeuuid,

      name text STATIC,
      description text STATIC,
      expires_at timestamp STATIC,

      access_groups set<text> STATIC,
      access_users set<uuid> STATIC,

      question_text text,
      question_type text,
      question_choices set<text>,

      PRIMARY KEY (form_id, question_id)
    );
  `,
  // form_responses
  `
    CREATE TABLE IF NOT EXISTS form_responses (
      form_id timeuuid,
      response_id timeuuid,

      name text STATIC,
      description text STATIC,
      expires_at timestamp STATIC,

      created_by uuid,
      created_at timestamp,
      last_modified_at timestamp,
      revision_id timeuuid,

      answers map<text,text>,

      PRIMARY KEY (form_id, response_id)
    );
  `,
  // form_responses_by_creator
  `
    CREATE TABLE IF NOT EXISTS form_responses_by_creator (
      created_by uuid,
      form_id timeuuid,
      response_id timeuuid,

      name text,
      description text,
      expires_at timestamp,

      created_at timestamp,
      last_modified_at timestamp,
      revision_id timeuuid,

      answers map<text,text>,

      PRIMARY KEY (created_by, form_id)
    )
  `,
  // form_responses_by_creator_response_id
  `
    CREATE TABLE IF NOT EXISTS form_responses_by_creator_response_id (
      created_by uuid,
      response_id timeuuid,
      form_id timeuuid,

      name text,
      description text,
      expires_at timestamp,

      created_at timestamp,
      last_modified_at timestamp,
      revision_id timeuuid,

      answers map<text,text>,

      PRIMARY KEY (created_by, response_id)
    )
  `
];

module.exports = queries;
