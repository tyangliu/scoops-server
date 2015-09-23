'use strict';

let restify = require('restify');

var server = restify.createServer({
  name: 'scoops-server'
});

server.get('/hello/:name', (req, res, next) => {
  res.send('hello ' + req.params.name);
  return next();
});

server.listen(8080, () => {
  console.log('%s listening at %s', server.name, server.url);
});
