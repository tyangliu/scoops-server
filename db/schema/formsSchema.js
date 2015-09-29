'use strict';

let queries = [
  // question
  `
    CREATE TYPE IF NOT EXISTS question (
      id timeuuid,
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
  // form_summary
  `
    CREATE TYPE IF NOT EXISTS form_summary (
      id timeuuid,
      name text,
      description text
    );
  `,
  // forms
  `
    CREATE TABLE IF NOT EXISTS forms (
      id timeuuid,

      name text,
      description text,

      start timestamp,
      end timestamp,

      published boolean,

      creator frozen<user_summary>,
      created timestamp,
      updated timestamp,
      revision timeuuid,

      questions list<frozen<question>>,

      PRIMARY KEY (id)
    );
  `,
  // forms_by_creator
  `
    CREATE TABLE IF NOT EXISTS forms_by_creator (
      creator_id uuid,
      id timeuuid,

      name text,
      description text,

      start timestamp,
      end timestamp,

      published boolean,

      creator frozen<user_summary>,
      created timestamp,
      updated timestamp,
      revision timeuuid,

      questions list<frozen<question>>,

      PRIMARY KEY (creator_id, id)
    );
  `
];

module.exports = queries;
