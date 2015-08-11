var async = require('async');

module.exports = function (app) {
  app.require('collection', 'server_posts', 'stats');
  return app.collection({
    name: 'servers',
    save: function (server, cb) {
      delete server.last_post;
      delete server.meta;
      if (!server.label) return cb(new Error('label is required'));
      cb();
    },
    load: function (server, cb) {
      app.server_posts(server.id).tail(0, {load: true}, function (err, chunk, getNext) {
        if (err) return cb(err);
        server.last_post = chunk[0];
        server.meta = {};
        async.parallel({
          load_avg: function (done) {
            app.stats.graph(server.id + ':load_avg', '15m', {start: new Date().getTime() - 86400000}, function (err, results) {
              if (err) return done(err);
              results = results.map(function (r) {
                return r.close;
              });
              done(null, results);
            });
          },
          tcp_conns: function (done) {
            app.stats.graph(server.id + ':tcp_conns', '15m', {start: new Date().getTime() - 86400000}, function (err, results) {
              if (err) return done(err);
              results = results.map(function (r) {
                return r.close;
              });
              done(null, results);
            });
          }
        }, function (err, results) {
          if (err) return cb(err);
          Object.keys(results).forEach(function (k) {
            server.meta[k] = results[k].join(',');
          });
          console.log('loaded', JSON.stringify(server, null, 2));
          cb(null, server);
        });
      });
    }
  });
};
