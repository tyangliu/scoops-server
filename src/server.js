'use strict';

let restify = require('restify')
  , passport = require('passport')
  , fs = require('fs');

createServer();

function createServer() {
  let server = restify.createServer({
    name: 'scoops-server'
  });

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.authorizationParser());
  server.use(passport.initialize());

  // include passport strategies
  require('./auth/strategies');

  let dirs = ['./auth', './users', './articles', './events'];
  dirs.forEach(dir => require(dir + '/routes')(server));

  server.listen(8080, () => {
    console.log('%s listening at %s', server.name, server.url);
  });

  return server;
}
