'use strict';

let queries = [
  // events
  `
    CREATE TABLE IF NOT EXISTS events (
      id timeuuid,

      name text,
      location frozen<location>,
      link_name text,
      image_url text,

      start_at timestamp,
      end_at timestamp,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      PRIMARY KEY (id)
    );
  `,
  // events_by_creator
  `
    CREATE TABLE IF NOT EXISTS events_by_creator (
      creator_id uuid,
      id timeuuid,

      name text,
      location frozen<location>,
      link_name text,
      image_url text,

      start_at timestamp,
      end_at timestamp,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      PRIMARY KEY (creator_id, id)
    );
  `,
  // events_by_start
  `
    CREATE TABLE IF NOT EXISTS events_by_start (
      start_year int,
      start_at timestamp,
      id timeuuid,

      name text,
      location frozen<location>,
      link_name text,
      image_url text,

      end_at timestamp,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      PRIMARY KEY (start_year, start_at, id)
    );
  `,
  // events_by_link_name
  `
    CREATE TABLE IF NOT EXISTS events_by_link_name (
      link_name text,

      id timeuuid,

      name text,
      location frozen<location>,
      image_url text,

      start_at timestamp,
      end_at timestamp,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      PRIMARY KEY (link_name)
    );
  `,
  // events_change_log
  `
    CREATE TABLE IF NOT EXISTS events_change_log (
      id timeuuid,
      revision timeuuid,

      name text,
      location frozen<location>,
      link_name text,
      image_url text,

      start_at timestamp,
      end_at timestamp,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,

      PRIMARY KEY (id, revision)
    );
  `
];

module.exports = queries;
