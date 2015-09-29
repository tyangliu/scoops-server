'use strict';

let queries = [
  // question
  `
    CREATE TYPE IF NOT EXISTS question (
      id timeuuid,
      type text,
      label text,
      description text,
      pattern text,

      choices list<text>
    );
  `,
  // answer
  `
    CREATE TYPE IF NOT EXISTS answer (
      question_id timeuuid,
      question_label text,
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
      link_name text,
      description text,
      image_url text,

      start_at timestamp,
      end_at timestamp,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
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
      link_name text,
      description text,
      image_url text,

      start_at timestamp,
      end_at timestamp,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      questions list<frozen<question>>,

      PRIMARY KEY (creator_id, id)
    );
  `,
  // forms_by_start
  `
    CREATE TABLE IF NOT EXISTS forms_by_start (
      start_year int,
      start_at timestamp,
      id timeuuid,

      name text,
      link_name text,
      description text,
      image_url text,

      end_at timestamp,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      questions list<frozen<question>>,

      PRIMARY KEY (start_year, start_at, id)
    );
  `,
  // forms_by_link_name
  `
    CREATE TABLE IF NOT EXISTS forms_by_link_name (
      link_name text,
      id timeuuid,

      name text,
      description text,
      image_url text,

      start_at timestamp,
      end_at timestamp,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      questions list<frozen<question>>,

      PRIMARY KEY (link_name, id)
    );
  `
];

module.exports = queries;
