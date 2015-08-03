var url = require('url');

module.exports = function (app) {
  app.require('collection', 'site_scans');
  return app.collection({
    name: 'sites',
    save: function (site, cb) {
      delete site.last_scan;
      if (!site.url) return cb(new Error('url is required'));
      site.parsed_url = url.parse(site.url);
      cb();
    },
    load: function (site, cb) {
      app.site_scans(site.id).tail(0, {load: true}, function (err, chunk, getNext) {
        if (err) return cb(err);
        site.last_scan = chunk[0];
        cb(null, site);
      });
    }
  });
};
