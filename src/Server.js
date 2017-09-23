const fs = require('fs');
const mv = require('mv');
const path = require('path');
const express = require('express');
const formidable = require('formidable');
const uniqueSlug = require('unique-slug');
const session = require('express-session');
const auth = require('../auth.json');

const WWW_PATH = path.join(__dirname, '..', 'www');
const COMICS_PATH = path.join(__dirname, '..', 'assets', 'comics');
const comicTypes = {
  begin: 'begin',
  middle: 'middle',
  end: 'end'
};
const regexValidFilename = new RegExp(/^[0-9a-zA-Z_.]+$/);

const Server = {
  authCheck(from, req, res) {
    if (req.session.logged !== auth.uploadSecret) {
      req.session.from = from;
      res.sendFile(path.join(WWW_PATH, 'auth.html'));
      return false;
    }

    return true;
  },

  start() {
    // Express server
    const app = express();

    app.use(session({
      secret: auth.token + auth.uploadSecret,
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 60000
      }
    }));

    app.post('/auth', function (req, res) {
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
    });

    // Upload Strips
    app.get('/upload', function (req, res) {
      if(!Server.authCheck('/upload', req, res)) {
        return;
      }

      res.sendFile(path.join(WWW_PATH, 'uploadStrip.html'));
    });

    app.get('/allUploaded', function (req, res) {
      if(!Server.authCheck('/allUploaded', req, res)) {
        return;
      }

      res.sendFile(path.join(WWW_PATH, 'uploadedStrips.html'));
    });

    app.get('/uploadedStrips/:type', function (req, res) {
      if(!Server.authCheck(`/uploadedStrips/${req.params.type}`, req, res)) {
        return;
      }

      if (req.params.type !== 'begin' && req.params.type !== 'middle' && req.params.type !== 'end') {
        res.send('Invalid type');
        return;
      }

      fs.readdir(path.join(COMICS_PATH, req.params.type), (err, strips) => {
        const stripsCollection = [];

        strips.forEach(strip => {
          stripsCollection.push(strip);
        });

        res.send(JSON.stringify({strips: stripsCollection}));
      });
    });

    app.get('/viewStrip/:type/:strip', function (req, res) {
      if(!Server.authCheck(`/viewStrip/${req.params.type}/${req.params.strip}`, req, res)) {
        return;
      }

      if (!req.session.logged === true) {
        req.session.from = '/upload';
        res.sendFile(path.join(WWW_PATH, 'auth.html'));
        return;
      }

      if (req.params.type !== 'begin' && req.params.type !== 'middle' && req.params.type !== 'end') {
        res.send('Invalid type');
        return;
      }

      if (!regexValidFilename.test(req.params.strip)) {
        res.send('Invalid Strip name');
        return;
      }

      const filePath = path.join(COMICS_PATH, req.params.type, req.params.strip);

      res.sendFile(filePath, function (err) {
        if (err) {
          res.status(404)
            .send('Not found');
        }
      });
    });

    app.get('/deleteStrip/:type/:strip', function (req, res) {
      if(!Server.authCheck(`/deleteStrip/${req.params.type}/${req.params.strip}`, req, res)) {
        return;
      }

      if (req.params.type !== 'begin' && req.params.type !== 'middle' && req.params.type !== 'end') {
        res.send('Invalid type');
        return;
      }

      if (!regexValidFilename.test(req.params.strip)) {
        res.send('Invalid Strip name');
        return;
      }

      const filePath = path.join(COMICS_PATH, req.params.type, req.params.strip);

      fs.unlink(filePath, function (err) {
        if (err) {
          res.status(404)
            .send('Not found');
        } else {
          res.send('File deleted');
        }
      })
    });

    app.post('/fileupload', function (req, res) {
      if(!Server.authCheck('/upload', req, res)) {
        return;
      }

      const form = new formidable.IncomingForm();

      form.parse(req, function (err, fields, files) {
        if (!files.uploadfile) {
          res.send('No file');
          return;
        }

        const imgFile = files.uploadfile;
        const fileNameSplit = imgFile.name.split('.');
        const ext = fileNameSplit[fileNameSplit.length - 1].toLowerCase();

        if (fields.type !== 'begin' && fields.type !== 'middle' && fields.type !== 'end') {
          res.send('Invalid type');
          return;
        }

        if (imgFile.size > 15000000) {
          res.send('File exceeds 15MB');
          return;
        }

        const allowedTypes = {
          'image/png': 'png'
        };
        let allowedType = false;

        Object.keys(allowedTypes).forEach((type) => {
          if (type === imgFile.type && allowedTypes[type] === ext) {
            allowedType = true;
          }
        });

        if (!allowedType) {
          res.send('File type not supported.');
          return;
        }

        const oldPath = imgFile.path;
        const newPath = path.join(COMICS_PATH, fields.type, `${uniqueSlug()}_${imgFile.name}`);

        mv(oldPath, newPath, function (err) {
          if (err) throw err;
          res.write('File uploaded!');
          res.end();
        });
      });
    });

    app.listen(3000, function () {
      console.log('Server listening on port 3000!')
    });
  }
};

module.exports = Server;