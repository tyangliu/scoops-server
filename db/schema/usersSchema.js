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

      preferences map<text,text>,

      created timestamp,
      updated timestamp,

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

      created timestamp,
      updated timestamp,

      PRIMARY KEY (email)
    );
  `
];

module.exports = queries;
