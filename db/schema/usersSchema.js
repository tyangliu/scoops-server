'use strict';

let queries = [
  `
    CREATE TYPE IF NOT EXISTS user_summary (
      id uuid,
      email text,
      name text
    );
  `,
  // users
  `
    CREATE TABLE IF NOT EXISTS users (
      id uuid,

      email text,
      name text,
      hashed_password text,

      groups set<text>,
      preferences map<text,text>,

      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      PRIMARY KEY (id)
    );
  `,
  // users_by_email
  `
    CREATE TABLE IF NOT EXISTS users_by_email (
      email text,

      id uuid,
      name text,
      hashed_password text,

      groups set<text>,
      preferences map<text,text>,

      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      PRIMARY KEY (email)
    );
  `,
  // users_change_log
  `
    CREATE TABLE IF NOT EXISTS users_change_log (
      id uuid,
      revision timeuuid,

      email text,
      name text,
      hashed_password text,

      groups set<text>,
      preferences map<text,text>,

      created_at timestamp,
      updated_at timestamp,

      PRIMARY KEY (id, revision)
    );
  `
];

module.exports = queries;
