var tinyauth = require('tinyauth');

module.exports = function (app) {
  if (!app.conf.auth) return function (req, res, next) { next(); };
  return tinyauth(app.conf.auth);
};
module.exports.weight = 0;
