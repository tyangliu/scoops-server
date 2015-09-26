'use strict';

let restify = require('restify')
  , fs = require('fs');

createServer();

function createServer() {
  let server = restify.createServer({
    name: 'scoops-server'
  });

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.authorizationParser());
  server.use(restify.bodyParser());

  fs.readdirSync('./routes').forEach(file => {
    if (file.substr(-3) === '.js') {
      let route = require('./routes/' + file);
      route(server);
    }
  });

  server.listen(8080, () => {
    console.log('%s listening at %s', server.name, server.url);
  });

  return server;
}
