var redis = require('redis');

module.exports = function (app) {
  var conf = app.conf.redis || {};
  conf.port || (conf.port = 6379);
  conf.host || (conf.host = '127.0.0.1');
  conf.options || (conf.options = {});
  app.redis = redis.createClient(conf.port, conf.host, conf.options);
  return app.redis;
};