'use strict';

let async = require('async')
  , db = require('./dbClient')()
  , formsSchema = require('./schema/formsSchema');

let queries = formsSchema;

async.map(queries,
  (query, next)  => db.execute(query, next),
  (err, results) => {
    err ? console.log(err)
        : console.log('Finished creating tables.');
    process.exit();
  }
);
