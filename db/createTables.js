'use strict';

let async = require('async')
  , fs = require('fs')
  , db = require('./dbClient')();

let queries = [];

fs.readdirSync('./schema').forEach(file => {
  if (file.substr(-3) === '.js') {
    let schema = require('./schema/' + file);
    queries = queries.concat(schema);
  }
});

async.map(queries,
  (query, next)  => db.execute(query, next),
  (err, results) => {
    err ? console.log(err)
        : console.log('Finished creating tables.');
    process.exit();
  }
);
