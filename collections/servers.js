module.exports = function (app) {
  app.require('collection', 'server_posts');
  return app.collection({
    name: 'servers',
    save: function (server, cb) {
      delete server.last_post;
      if (!server.label) return cb(new Error('label is required'));
      cb();
    },
    load: function (server, cb) {
      app.server_posts(server.id).tail(0, {load: true}, function (err, chunk, getNext) {
        if (err) return cb(err);
        server.last_post = chunk[0];
        cb(null, server);
      });
    }
  });
};
