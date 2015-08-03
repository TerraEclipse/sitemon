var url = require('url');

module.exports = function (app) {
  app.require('collection');
  return app.collection({
    name: 'sites',
    save: function (site, cb) {
      if (!site.url) return cb(new Error('url is required'));
      site.parsed_url = url.parse(site.url);
      cb();
    }
  });
};
