module.exports = function (app) {
  app.require('request', 'site_scans');
  return function (site, cb) {
    if (!site.active) return cb(null, null);
    console.log('scan', site.parsed_url.hostname);
    var scan = {};
    var started = new Date();
    app.request({
      uri: site.url,
      followRedirect: false,
      timeout: 20000,
      strictSSL: true
    }, function (err, resp, body) {
      if (err) {
        scan.err = err;
        scan.code = 'danger';
        scan.reason = 'error';
      }
      else {
        scan.response_time = new Date().getTime() - started.getTime();
        scan.response_code = resp.statusCode;

        if (site.expected_status && resp.statusCode != site.expected_status) {
          scan.code = 'warning';
          scan.reason = 'unexpected_status: ' + resp.statusCode;
          scan.response = body;
        }
        else if (site.expected_pattern && !body.match(new RegExp(site.expected_pattern, 'i'))) {
          scan.code = 'warning';
          scan.reason = 'pattern_not_found: ' + site.expected_pattern;
          scan.response = body;
        }
        else {
          scan.code = 'success';
        }
      }
      app.site_scans(site.id).create(scan, function (err, scan) {
        if (err) return cb(err);
        if (site.last_scan && site.notify && app.conf.mailer && app.conf.mailer.from) {
          if (site.last_scan.code === 'success' && scan.code !== 'success') {
            // we have fallen into error/warning state
            var options = {
              from: app.conf.mailer.from,
              to: site.notify,
              subject: 'Warning: ' + site.parsed_url.hostname,
              text: 'Hi there,\n\nThis is a friendly automated notification\n' +
              'to inform you that ' + site.parsed_url.hostname + ' (' + site.label + ') may be experiencing issues.'
            };

            app.mailer.sendMail(options, function (err, info) {
              if (err) return cb(err);
              cb(null, scan);
            });
          }
          else if (site.last_scan.code !== 'success' && scan.code === 'success') {
            // we have fallen into OK state
            var options = {
              from: app.conf.mailer.from,
              to: site.notify,
              subject: 'OK: ' + site.parsed_url.hostname,
              text: 'Hi there,\n\nThis is a friendly automated notification\n' +
              'to inform you that ' + site.parsed_url.hostname + ' (' + site.label + ') seems to be OK now.'
            };

            app.mailer.sendMail(options, function (err, info) {
              if (err) return cb(err);
              cb(null, scan);
            });
          }
          else cb(null, scan);
        }
        else cb(null, scan);
      });
    });
  };
};
