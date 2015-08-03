var modeler = require('modeler-redis');

module.exports = function (app) {
  app.require('redis');
  return function (_opts) {
    _opts || (_opts = {});
    _opts.client = app.redis;
    _opts.prefix || (_opts.prefix = '');
    var prefix = (app.conf.id || '') + ':';
    if (_opts.prefix) prefix += _opts.prefix;
    _opts.prefix = prefix;
    return modeler(_opts);
  };
};
