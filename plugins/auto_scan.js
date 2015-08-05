module.exports = function (app) {
  var i;
  app.on('ready', function () {
    clearInterval(i);
    i = setInterval(function () {
      console.log('scan all');
      app.scan_all(function (err) {
        console.log('scan all done');
        if (err) app.emit('error', err);
      });
    }, 60000);
  });
};
