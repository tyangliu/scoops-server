'use strict';

let queries = [
  // form_responses
  `
    CREATE TABLE IF NOT EXISTS form_responses (
      form_id timeuuid,
      id timeuuid,

      form frozen<form_summary> STATIC,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      answers list<frozen<answer>>,

      PRIMARY KEY (form_id, id)
    );
  `,
  // form_responses_by_creator
  `
    CREATE TABLE IF NOT EXISTS form_responses_by_creator (
      creator_id uuid,
      form_id timeuuid,

      id timeuuid,

      form frozen<form_summary>,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      answers list<frozen<answer>>,

      PRIMARY KEY (creator_id, form_id)
    );
  `,
  // form_responses_by_creator_response_id
  // sort by completion date through timeuuid of response
  `
    CREATE TABLE IF NOT EXISTS form_responses_by_creator_response_id (
      creator_id uuid,
      id timeuuid,

      form_id timeuuid,

      form frozen<form_summary>,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      answers list<frozen<answer>>,

      PRIMARY KEY (creator_id, id)
    );
  `,
  // form_responses
  `
    CREATE TABLE IF NOT EXISTS form_responses_change_log (
      form_id timeuuid,
      id timeuuid,
      revision timeuuid,

      form frozen<form_summary> STATIC,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,

      answers list<frozen<answer>>,

      PRIMARY KEY (form_id, id, revision)
    );
  `
];

module.exports = queries;
