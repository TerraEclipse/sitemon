module.exports = function (app) {
  return function (server_id) {
    return app.collection({
      name: 'server_posts',
      prefix: server_id + ':',
      save: function (server_post, cb) {
        // record stats for each key
        Object.keys(server_post).forEach(function (k) {
          switch (k) {
            case "load_avg":
            case "tcp_conns":
              // console.log('recording stat', server_id + ':' + k, '=', server_post[k]);
              app.stats.record(server_id + ':' + k, server_post[k], function (err) {
                if (err) throw err;
              });
          }
        });
        cb();
      }
    });
  };
};