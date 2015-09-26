'use strict';

let restify = require('restify');

createServer();

function createServer() {
  let server = restify.createServer({
    name: 'scoops-server'
  });

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.authorizationParser());
  server.use(restify.bodyParser());

  server.get('/hello/:name', (req, res, next) => {
    res.send('hello ' + req.params.name);
    return next();
  });

  server.listen(8080, () => {
    console.log('%s listening at %s', server.name, server.url);
  });

  return server;
}
