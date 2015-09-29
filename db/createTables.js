'use strict';

let async = require('async')
  , fs = require('fs')
  , db = require('./dbClient')()
  , usersSchema = require('./schema/usersSchema')
  , formsSchema = require('./schema/formsSchema')
  , responsesSchema = require('./schema/responsesSchema');

let queries = [].concat(usersSchema, formsSchema, responsesSchema);

async.mapSeries(queries,
  (query, next)  => db.execute(query, next),
  (err, results) => {
    err ? console.log(err)
        : console.log('Finished creating tables.');
    process.exit();
  }
);
