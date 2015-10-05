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
  `,
  // clients_by_creator
  `
    CREATE TABLE IF NOT EXISTS clients_by_creator (
      creator_id uuid,
      id uuid,

      secret text,
      privileges set<text>,

      creator frozen<user_summary>,
      created_at timestamp,

      PRIMARY KEY (creator_id, id)
    )
  `
];

module.exports = queries;
