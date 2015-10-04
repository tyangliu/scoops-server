'use strict';

let queries = [
  // user_summary
  `
    CREATE TYPE IF NOT EXISTS user_summary (
      id uuid,
      email text,
      name text
    );
  `,
  // location
  `
    CREATE TYPE IF NOT EXISTS location (
      name text,
      latitude float,
      longitude float
    )
  `,
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
  // form_summary
  `
    CREATE TYPE IF NOT EXISTS form_summary (
      id timeuuid,
      name text,
      description text
    );
  `,
  // answer
  `
    CREATE TYPE IF NOT EXISTS answer (
      question_id timeuuid,
      question_label text,
      value text
    );
  `
];

module.exports = queries;
