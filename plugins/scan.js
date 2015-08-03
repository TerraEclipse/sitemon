module.exports = function (app) {
  app.require('request');
  return function (site, cb) {
    console.log('scan', site.parsed_url.hostname);
    var scan = {};
    app.request({uri: site.url, followRedirect: false}, function (err, resp, body) {
      if (err) {
        scan.err = err;
        scan.code = 'danger';
        scan.reason = 'error';
      }
      else {
        // scan.resp = resp;
        if (site.expected_status && resp.statusCode != site.expected_status) {
          scan.code = 'warning';
          scan.reason = 'unexpected_status: ' + resp.statusCode;
        }
        else if (site.expected_pattern && !body.match(new RegExp(site.expected_pattern, 'i'))) {
          scan.code = 'warning';
          scan.reason = 'pattern_not_found: ' + site.expected_pattern;
        }
        else {
          scan.code = 'success';
        }
      }
      console.log('resp', scan);
      cb(null, scan);
    });
  };
};
