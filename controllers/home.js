module.exports = function (app) {
  return app.controller()
    .get('/', function (req, res, next) {
      res.vars.sites = [];
      app.sites.tail(0, {load: true}, function (err, chunk, getNext) {
        if (err) return next(err);
        res.vars.sites = res.vars.sites.concat(chunk);
        if (chunk.length) getNext();
        else {
          res.render('index');
        }
      });
    })
};
