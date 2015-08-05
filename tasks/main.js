module.exports = function (app) {
  app.require('scan_all');
  app.scan_all(function () {
    process.exit();
  });
};
