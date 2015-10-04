'use strict';

let Promise = require('bluebird')
  , db = require('./client');

/**
 * Executes a single query, returning a Promise with the result,
 * optionally getting only a single result (as in the case when
 * querying with unique ids), and mapping the results
 * with a given row mapper function
 *
 * @param query {string} the query to be run
 * @param params {Array} array of params to pass with the query
 * @param options.single {string} whether or not only the first result should
 * be returned (as in the case when querying by id)
 * @param options.rowMapper {Function} a mapping function for the result rows
 * @returns {Promise} resolves to array of results or single result,
 * with result(s) mapped by rowMapper if given
 */
let find = Promise.coroutine(function *(query, params, options) {
  options = options || {};

  let single = options.single
    , rowMapper = options.rowMapper
    , rows = (yield db.executeAsync(query, params, { prepare: true })).rows;

  if (rows.length < 1) { return single ? null : []; }

  let result = rowMapper ? rows.map(rowMapper) : rows;
  return single ? result[0] : result;
});

module.exports = { find };
