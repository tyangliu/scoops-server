'use strict';

let Promise = require('bluebird')
  , fs = require('fs')
  , db = require('./client')
  , schema = require('./schema');

let typeQueries = schema.udts;

let tableQueries = [].concat(
  schema.auth, schema.users, schema.articles, schema.events,
  schema.forms, schema.responses, schema.files
);

Promise.coroutine(function *() {
  // creation of UDTs out of order is okay since there aren't any nested UDTs
  let promises = typeQueries.map(query => db.executeAsync(query));
  yield Promise.all(promises);
  // tables depend on UDTs, so must be created afterward
  promises = tableQueries.map(query => db.executeAsync(query));
  yield Promise.all(promises);

  console.log('Finished creating tables.');
  process.exit();
})();
