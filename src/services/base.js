const path = require('path');
const formidable = require('formidable');
const auth = require('../../auth.json');

class ServiceBase {
  static get wwwPath() {
    return path.join(__dirname, '..', '..', 'www');
  }

  static get stripsPath() {
    return path.join(__dirname, '..', '..', 'assets', 'comics');
  }

  static get gifsPath() {
    return path.join(__dirname, '..', '..', 'assets', 'gifs');
  }

  static get regexValidFilename() {
    return new RegExp(/^[0-9a-zA-Z_.]+$/);
  }

  static authCheck(from, req, res) {
    if (req.session.logged !== auth.uploadSecret) {
      req.session.from = from;
      res.sendFile(path.join(ServiceBase.wwwPath, 'auth.html'));
      return false;
    }

    return true;
  }

  static setRoutes(app) {
    app.post('/auth', ServiceBase.routeAuth);

    app.get('/upload', ServiceBase.uploadMain);
  }

  static routeAuth(req, res) {
    const form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
      if (fields.secret !== auth.uploadSecret) {
        res.send('Wrong secret');
      } else {
        req.session.logged = auth.uploadSecret;

        if (!req.session.from) {
          res.redirect('/upload');
        } else {
          res.redirect(req.session.from);
        }
      }
    });
  }

  static uploadMain(req, res) {
    if (!ServiceBase.authCheck('/upload', req, res)) {
      return;
    }

    res.sendFile(path.join(ServiceBase.wwwPath, 'upload.html'));
  }
}

module.exports = ServiceBase;