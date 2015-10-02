'use strict';

let queries = [
  // files
  `
    CREATE TABLE IF NOT EXISTS files (
      id timeuuid,

      mime_type text,
      path text,
      size int,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      PRIMARY KEY (id)
    )
  `,
  // files_by_creator
  `
    CREATE TABLE IF NOT EXISTS files_by_creator (
      creator_id uuid,
      id timeuuid,

      mime_type text,
      path text,
      size int,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      PRIMARY KEY (creator_id, id)
    )
  `,
  // files_by_created
  `
    CREATE TABLE IF NOT EXISTS files_by_created (
      created_year int,
      created_at timestamp,
      id timeuuid,

      mime_type text,
      path text,
      size int,

      creator frozen<user_summary>,
      updated_at timestamp,
      revision timeuuid,

      PRIMARY KEY (created_year, created_at, id)
    )
  `,
  // files_change_log
  `
    CREATE TABLE IF NOT EXISTS files_change_log (
      id timeuuid,
      revision timeuuid,

      mime_type text,
      path text,
      size int,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,

      PRIMARY KEY (id, revision)
    )
  `
];

module.exports = queries;
