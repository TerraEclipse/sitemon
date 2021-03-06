var nodemailer = require('nodemailer');

module.exports = function (app) {
  var conf = app.conf.mailer || {};
  conf.options || (conf.options = {});

  var service;
  if (conf.service === 'SES' || conf.service === 'ses') {
    var transport = require('nodemailer-ses-transport');
    service = 'ses';
  }
  else {
    var transport = require('nodemailer-stub-transport');
    service = 'stub';
  }
  var mailer = nodemailer.createTransport(transport(conf.options));

  return {
    sendMail: function (_opts, cb) {
      _opts || (_opts = {});
      mailer.sendMail(_opts, function (err, info) {
        if (err) throw err;
        var resp = '';
        if (info) {
          resp = info.response ? info.response.toString() : info;
        }
        console.log('mailer', '[' + service + ']\n', resp);
        cb && cb(err, info);
      });
    }
  };
};
