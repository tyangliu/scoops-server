'use strict';

let queries = [
  // articles
  `
    CREATE TABLE IF NOT EXISTS articles (
      id timeuuid,

      name text,
      link_name text,
      image_id timeuuid,
      content text,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      PRIMARY KEY (id)
    );
  `,
  // articles_by_creator
  `
    CREATE TABLE IF NOT EXISTS articles_by_creator (
      creator_id uuid,
      id timeuuid,

      name text,
      link_name text,
      image_id timeuuid,
      content text,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      PRIMARY KEY (creator_id, id)
    );
  `,
  // articles_by_published
  `
    CREATE TABLE IF NOT EXISTS articles_by_published (
      published_year int,
      published_at timestamp,
      id timeuuid,

      name text,
      link_name text,
      image_id timeuuid,
      content text,

      published boolean,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      PRIMARY KEY (published_year, published_at, id)
    );
  `,
  // articles_by_link_name
  `
    CREATE TABLE IF NOT EXISTS articles_by_link_name (
      link_name text,

      id timeuuid,

      name text,
      image_id timeuuid,
      content text,

      published boolean,
      published_at timestamp,

      creator frozen<user_summary>,
      created_at timestamp,
      updated_at timestamp,
      revision timeuuid,

      PRIMARY KEY (link_name)
    );
  `,
  // articles
  `
    CREATE TABLE IF NOT EXISTS articles_change_log (
      id timeuuid,
      revision timeuuid,

      name text,
      link_name text,
      image_id timeuuid,
      content text,

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
