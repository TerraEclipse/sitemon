module.exports = function (app) {
  if (app._i) clearInterval(app._i);
  app._i = setInterval(function () {
    console.log('scan all');
    app.scan_all(function (err) {
      console.log('scan all done');
      if (err) app.emit('error', err);
    });
  }, 60000 * 5);
};