'use strict';

let queries = [
  // question
  `
    CREATE TYPE IF NOT EXISTS question (
      question_id timeuuid,
      type text,
      label text,
      description text,

      choices list<text>
    );
  `,
  // answer
  `
    CREATE TYPE IF NOT EXISTS answer (
      question_id timeuuid,
      question_type text,
      question_label text,
      question_description text,

      value text
    );
  `,
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

      questions list<frozen <question>>,

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

      questions list<frozen <question>>,

      PRIMARY KEY (created_by, form_id)
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

      answers list<frozen <answer>>,

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

      answers list<frozen <answer>>,

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

      answers list<frozen <answer>>,

      PRIMARY KEY (created_by, response_id)
    )
  `
];

module.exports = queries;
