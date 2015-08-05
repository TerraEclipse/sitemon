module.exports = function (app) {
  var i;
  app.on('ready', function () {
    i = setInterval(function () {
      app.scan_all(function (err) {
        if (err) app.emit('error', err);
      });
    }, 60000 * 5);
  });
  app.on('close', function () {
    clearInterval(i);
  });
};
