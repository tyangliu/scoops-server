'use strict';

let queries = [
  // form_responses
  `
    CREATE TABLE IF NOT EXISTS form_responses (
      form_id timeuuid,
      id timeuuid,

      form frozen<form_summary> STATIC,

      creator frozen<user_summary>,
      created timestamp,
      updated timestamp,
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

      creator frozen<user_summary>,
      created timestamp,
      updated timestamp,
      revision timeuuid,

      answers list<frozen<answer>>,

      PRIMARY KEY (creator_id, form_id, id)
    )
  `,
  // form_responses_by_creator_response_id
  `
    CREATE TABLE IF NOT EXISTS form_responses_by_creator_response_id (
      creator_id uuid,
      id timeuuid,
      form_id timeuuid,

      form frozen<form_summary>,

      name text,
      description text,

      creator frozen<user_summary>,
      created timestamp,
      updated timestamp,
      revision timeuuid,

      answers list<frozen<answer>>,

      PRIMARY KEY (creator_id, id)
    )
  `
];

module.exports = queries;
