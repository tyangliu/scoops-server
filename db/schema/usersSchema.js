'use strict';

let queries = [
  // users
  `
    CREATE TABLE IF NOT EXISTS users (
      user_id uuid,
      email text,
      name text,
      hashed_password text,

      groups set<text>,
      preferences map<text,text>,

      created_at timestamp,
      last_modified_at timestamp,
      last_modified_by uuid,

      PRIMARY KEY (user_id, email)
    );
  `,
  // users_by_email
  `
    CREATE TABLE IF NOT EXISTS users_by_email (
      email text,
      user_id uuid,
      name text,
      hashed_password text,

      groups set<text>,
      preferences map<text,text>,

      created_at timestamp,
      last_modified_at timestamp,
      last_modified_by uuid,

      PRIMARY KEY (email, user_id)
    );
  `
];

module.exports = queries;
