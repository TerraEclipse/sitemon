module.exports = function (app) {
  app.require('sites', 'scan');

  return function (cb) {
    var sites = [];
    app.sites.head(0, {load: true}, function (err, chunk, getNext) {
      if (err) throw err;
      sites = sites.concat(chunk);
      if (chunk.length) getNext();
      else {
        var latch = sites.length;
        if (!latch) return cb();
        sites.forEach(function (site) {
          app.scan(site, function (err, result) {
            if (!--latch) cb();
          });
        });
      }
    });
  };
};
