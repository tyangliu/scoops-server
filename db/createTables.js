'use strict';

let async = require('async')
  , fs = require('fs')
  , db = require('./dbClient')()
  , schema = require('./schema');

let queries = [].concat(
  schema.users, schema.articles, schema.events,
  schema.forms, schema.responses, schema.files
);

async.mapSeries(queries,
  (query, next)  => db.execute(query, next),
  (err, results) => {
    err ? console.log(err)
        : console.log('Finished creating tables.');
    process.exit();
  }
);
