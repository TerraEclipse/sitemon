module.exports = function (app) {
  var sites = [];
  app.require('sites', 'scan');
  app.sites.head(0, {load: true}, function (err, chunk, getNext) {
    if (err) throw err;
    sites = sites.concat(chunk);
    if (chunk.length) getNext();
    else {
      var latch = sites.length;
      if (!latch) return process.exit();
      sites.forEach(function (site) {
        app.scan(site, function (err, result) {
          if (!--latch) process.exit();
        });
      });
    }
  });
};
