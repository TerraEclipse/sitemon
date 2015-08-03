module.exports = function (app) {
  return app.controller()
    .post('/sites/new', function (req, res, next) {
      var site = {
        url: req.body.url,
        label: req.body.label,
        expected_status: Number(req.body.expected_status),
        expected_pattern: req.body.expected_pattern,
        notify: !!req.body.notify
      };
      app.sites.create(site, function (err, site) {
        if (err) return next(err);
        console.log('created', JSON.stringify(site, null, 2));
        res.redirect('/sites/' + site.id);
      });
    })
    .get('/sites/new', function (req, res, next) {
      res.render('sites/new');
    })
    .get('/sites/:id/scan', function (req, res, next) {
      app.sites.load(req.params.id, function (err, site) {
        if (err) return next(err);
        if (!site) return res.renderStatus(404);
        app.scan(site, function (err, resp) {
          if (err) return next(err);
          res.redirect('/sites/' + site.id);
        });
      });
    })
    .get('/sites/:id', function (req, res, next) {
      app.sites.load(req.params.id, function (err, site) {
        if (err) return next(err);
        if (!site) return res.renderStatus(404);
        res.vars.site = site;
        res.render('sites/view');
      });
    })
    .post('/sites/:id/edit', function (req, res, next) {
      app.sites.load(req.params.id, function (err, site) {
        if (err) return next(err);
        if (!site) return res.renderStatus(404);
        var site2 = {
          url: req.body.url,
          label: req.body.label,
          expected_status: Number(req.body.expected_status),
          expected_pattern: req.body.expected_pattern,
          notify: !!req.body.notify
        };
        Object.keys(site2).forEach(function (k) {
          site[k] = site2[k];
        });
        app.sites.save(site, function (err, site) {
          if (err) return next(err);
          console.log('saved', JSON.stringify(site, null, 2));
          res.redirect('/sites/' + site.id);
        });
      });
    })
    .get('/sites/:id/edit', function (req, res, next) {
      app.sites.load(req.params.id, function (err, site) {
        if (err) return next(err);
        if (!site) return res.renderStatus(404);
        res.vars.site = site;
        res.render('sites/edit');
      });
    })
};
