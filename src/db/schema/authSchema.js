'use strict';

let queries = [
  // clients
  `
    CREATE TABLE IF NOT EXISTS clients (
      id uuid,

      secret text,
      privileges set<text>,

      creator frozen<user_summary>,
      created_at timestamp,

      PRIMARY KEY (id)
    )
  `
];

module.exports = queries;
