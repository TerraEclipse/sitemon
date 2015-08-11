module.exports = function (app) {
  return app.controller()
    .get('/servers', function (req, res, next) {
      res.vars.servers = [];
      app.servers.tail(0, {load: true}, function (err, chunk, getNext) {
        if (err) return next(err);
        res.vars.servers = res.vars.servers.concat(chunk);
        if (chunk.length) getNext();
        else {
          res.render('servers/index');
        }
      });
    })
    .post('/servers/:server_id/data', function (req, res, next) {
      app.servers.load(req.params.server_id, function (err, server) {
        if (err) return next(err);
        if (!server) return res.renderStatus(404);
        var server_post = {};
        Object.keys(req.body).forEach(function (k) {
          switch (k) {
            case "mem_total":
            case "mem_used":
            case "mem_free":
            case "swap_total":
            case "swap_used":
            case "swap_free":
            case "load_avg":
            case "running":
            case "disk_pct":
            case "tcp_conns":
              server_post[k] = Number(req.body[k]); break;
          }
        });
        // console.log('got server_post', server_post);
        if (Object.keys(server_post).length === 0) return res.renderStatus(400);
        app.server_posts(server.id).create(server_post, function (err, server_post) {
          if (err) return next(err);
          res.json(server_post);
        });
      });
    })
    .get('/servers/:server_id/delete', function (req, res, next) {
      app.servers.destroy(req.params.server_id, function (err, server) {
        if (err) return next(err);
        res.redirect('/');
      });
    })
    .get('/servers/:server_id/post/:post_id', function (req, res, next) {
      app.servers.load(req.params.server_id, function (err, server) {
        if (err) return next(err);
        if (!server) return res.renderStatus(404);
        app.server_posts(server.id).load(req.params.post_id, function (err, server_post) {
          if (err) return next(err);
          if (!server_post) return res.renderStatus(404);
          res.vars.post_json = JSON.stringify(server_post, null, 2);
          res.render('servers/post');
        });
      });
    })
    .post('/servers/new', function (req, res, next) {
      var server = {
        label: req.body.label,
        active: !!req.body.active,
        notify: req.body.notify
      };
      app.servers.create(server, function (err, server) {
        if (err) return next(err);
        // console.log('created', JSON.stringify(server, null, 2));
        res.redirect('/servers/' + server.id);
      });
    })
    .get('/servers/new', function (req, res, next) {
      res.render('servers/new');
    })
    .get('/servers/:id', function (req, res, next) {
      res.vars.offset = Number(req.query.offset || 0);
      app.servers.load(req.params.id, function (err, server) {
        if (err) return next(err);
        if (!server) return res.renderStatus(404);
        res.vars.server = server;
        res.vars.posts = [];
        app.server_posts(server.id).tail(50, {offset: res.vars.offset, load: true}, function (err, chunk, getNext) {
          if (err) return next(err);
          res.vars.posts = res.vars.posts.concat(chunk);
          if (chunk.length && res.vars.posts.length < 50) getNext();
          else {
            res.vars.offset += res.vars.posts.length;
            res.render('servers/view');
          }
        });
      });
    })
    .get('/servers/:id/clear', function (req, res, next) {
      app.servers.load(req.params.id, function (err, server) {
        if (err) return next(err);
        if (!server) return res.renderStatus(404);
        var deleted = 0;

        app.server_posts(server.id).head(0, function (err, chunk, getNext) {
          if (err) return next(err);
          var latch = chunk.length;
          if (latch) {
            chunk.forEach(function (post_id) {
              app.server_posts(server.id).destroy(post_id, function (err) {
                if (err) return next(err);
                deleted++;
                if (!--latch) {
                  getNext();
                }
              });
            });
          }
          else {
            console.log('deleted', deleted, 'server_posts');
            res.redirect('/servers/' + req.params.id);
          }
        });
      });
    })
    .post('/servers/:id/edit', function (req, res, next) {
      app.servers.load(req.params.id, function (err, server) {
        if (err) return next(err);
        if (!server) return res.renderStatus(404);
        var server2 = {
          label: req.body.label,
          active: !!req.body.active,
          notify: req.body.notify
        };
        Object.keys(server2).forEach(function (k) {
          server[k] = server2[k];
        });
        app.servers.save(server, function (err, server) {
          if (err) return next(err);
          // console.log('saved', JSON.stringify(server, null, 2));
          res.redirect('/servers/' + server.id);
        });
      });
    })
    .get('/servers/:id/edit', function (req, res, next) {
      app.servers.load(req.params.id, function (err, server) {
        if (err) return next(err);
        if (!server) return res.renderStatus(404);
        res.vars.server = server;
        res.render('servers/edit');
      });
    })
};
