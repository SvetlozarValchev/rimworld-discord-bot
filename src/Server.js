const mv = require('mv');
const path = require('path');
const express = require('express');
const formidable = require('formidable');
const uniqueSlug = require('unique-slug');
const auth = require('../auth.json');

const COMICS_PATH = path.join(__dirname, '..', 'assets', 'comics');

const Server = {
  start() {
    // Express server
    const app = express();

    app.get('/upload', function (req, res) {
      res.sendFile(path.join(__dirname, '..', 'www', 'upload.html'));
    });

    app.post('/fileupload', function (req, res) {
      const form = new formidable.IncomingForm();

      form.parse(req, function (err, fields, files) {
        const imgFile = files.uploadfile;
        const fileNameSplit = imgFile.name.split('.');
        const ext = fileNameSplit[fileNameSplit.length - 1].toLowerCase();

        if(fields.secret !== auth.uploadSecret) {
          res.send('Wrong secret');
          return;
        }

        if(fields.type !== 'begin' && fields.type !== 'middle' && fields.type !== 'end') {
          res.send('Invalid type');
          return;
        }

        if(imgFile.size > 15000000) {
          res.send('File exceeds 15MB');
          return;
        }

        const allowedTypes = {
          'image/png': 'png'
        };
        let allowedType = false;

        Object.keys(allowedTypes).forEach((type) => {
          if(type === imgFile.type && allowedTypes[type] === ext) {
            allowedType = true;
          }
        });

        if(!allowedType) {
          res.send('File type not supported.');
          return;
        }

        const oldPath = imgFile.path;
        const newPath = path.join(COMICS_PATH, fields.type, `${uniqueSlug()}_${imgFile.name}`);

        mv(oldPath, newPath, function(err) {
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