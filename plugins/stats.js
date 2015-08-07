var statpipe = require('statpipe');

module.exports = function (app) {
  app.require('redis');
  return statpipe({client: app.redis});
};
