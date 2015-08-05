module.exports = function (app) {
  return app.controller()
    .get('/sites/:site_id/delete', function (req, res, next) {
      app.sites.destroy(req.params.site_id, function (err, site) {
        if (err) return next(err);
        res.redirect('/');
      });
    })
    .get('/sites/:site_id/scan/:scan_id', function (req, res, next) {
      app.sites.load(req.params.site_id, function (err, site) {
        if (err) return next(err);
        if (!site) return res.renderStatus(404);
        app.site_scans(site.id).load(req.params.scan_id, function (err, scan) {
          if (err) return next(err);
          if (!scan) return res.renderStatus(404);
          res.vars.scan_json = JSON.stringify(scan, null, 2);
          res.render('sites/scan');
        });
      });
    })
    .post('/sites/new', function (req, res, next) {
      var site = {
        url: req.body.url,
        label: req.body.label,
        expected_status: Number(req.body.expected_status),
        expected_pattern: req.body.expected_pattern,
        active: !!req.body.active,
        notify: req.body.notify
      };
      app.sites.create(site, function (err, site) {
        if (err) return next(err);
        // console.log('created', JSON.stringify(site, null, 2));
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
      res.vars.offset = Number(req.query.offset || 0);
      app.sites.load(req.params.id, function (err, site) {
        if (err) return next(err);
        if (!site) return res.renderStatus(404);
        res.vars.site = site;
        res.vars.scans = [];
        app.site_scans(site.id).tail(50, {offset: res.vars.offset, load: true}, function (err, chunk, getNext) {
          if (err) return next(err);
          res.vars.scans = res.vars.scans.concat(chunk);
          if (chunk.length && res.vars.scans.length < 50) getNext();
          else {
            res.vars.offset += res.vars.scans.length;
            res.render('sites/view');
          }
        });
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
          active: !!req.body.active,
          notify: req.body.notify
        };
        Object.keys(site2).forEach(function (k) {
          site[k] = site2[k];
        });
        app.sites.save(site, function (err, site) {
          if (err) return next(err);
          // console.log('saved', JSON.stringify(site, null, 2));
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
