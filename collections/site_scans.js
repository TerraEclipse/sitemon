module.exports = function (app) {
  return function (site_id) {
    return app.collection({
      name: 'site_scans',
      prefix: site_id + ':'
    });
  };
};