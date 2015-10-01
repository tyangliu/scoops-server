'use strict';

let db = require('./dbClient')();

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
function find(query, params, options) {
  let options = options || {}
    , single = options.single
    , rowMapper = options.rowMapper;

  let promise = new Promise((resolve, reject) => {
    db.execute(query, params, { prepare: true }, (err, queryResult) => {
      if (err) { return reject(err); }

      let rows = queryResult.rows;
      if (rows.length) { return single ? null : []; }

      let result = rowMapper ? rows.map(rowMapper) : rows;
      resolve(single ? result[0] : result);
    });
  });

  return promise;
}

module.exports = { find };
