const fs = require('fs');
const mv = require('mv');
const path = require('path');
const formidable = require('formidable');
const uniqueSlug = require('unique-slug');

const ServiceBase = require('./base');

class ServiceUploadGifs {
  static setRoutes(app) {
    app.get('/uploadGif', ServiceUploadGifs.uploadGif);

    app.get('/uploadedGifs', ServiceUploadGifs.uploadedGifs);

    app.get('/fetchUploadedGifs', ServiceUploadGifs.fetchUploadedGifs);

    app.get('/viewGif/:gif', ServiceUploadGifs.viewGif);

    app.get('/deleteGif/:gif', ServiceUploadGifs.deleteGif);

    app.post('/uploadGifFile', ServiceUploadGifs.uploadGifFile);
  }

  static uploadGif(req, res) {
    if (!ServiceBase.authCheck('/uploadGif', req, res)) {
      return;
    }

    res.sendFile(path.join(ServiceBase.wwwPath, 'uploadGif.html'));
  };

  static uploadedGifs(req, res) {
    if (!ServiceBase.authCheck('/uploadedGifs', req, res)) {
      return;
    }

    res.sendFile(path.join(ServiceBase.wwwPath, 'uploadedGifs.html'));
  }

  static fetchUploadedGifs(req, res) {
    if (!ServiceBase.authCheck(`/fetchUploadedGifs`, req, res)) {
      return;
    }

    fs.readdir(ServiceBase.gifsPath, (err, gifs) => {
      const gifsCollection = [];

      gifs.forEach(gif => {
        gifsCollection.push(gif);
      });

      res.send(JSON.stringify({gifs: gifsCollection}));
    });
  }

  static viewGif(req, res) {
    if (!ServiceBase.authCheck(`/viewGif/${req.params.gif}`, req, res)) {
      return;
    }

    if (!ServiceBase.regexValidFilename.test(req.params.gif)) {
      res.send('Invalid Gif name');
      return;
    }

    const filePath = path.join(ServiceBase.gifsPath, req.params.gif);

    res.sendFile(filePath, function (err) {
      if (err) {
        res.status(404)
          .send('Not found');
      }
    });
  }

  static deleteGif(req, res) {
    if (!ServiceBase.authCheck(`/deleteGif/${req.params.gif}`, req, res)) {
      return;
    }

    if (!ServiceBase.regexValidFilename.test(req.params.gif)) {
      res.send('Invalid Gif name');
      return;
    }

    const filePath = path.join(ServiceBase.gifsPath, req.params.gif);

    fs.unlink(filePath, function (err) {
      if (err) {
        res.status(404)
          .send('Not found');
      } else {
        res.redirect('/uploadedGifs');
      }
    })
  }

  static uploadGifFile(req, res) {
    if (!ServiceBase.authCheck('/uploadGif', req, res)) {
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

      if(!fields.name) {
        res.send('No name specified');
        return;
      }

      if (imgFile.size > 15000000) {
        res.send('File exceeds 15MB');
        return;
      }

      const allowedTypes = {
        'image/gif': 'gif'
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
      const newPath = path.join(ServiceBase.gifsPath, `${fields.name}_${uniqueSlug()}.gif`);

      mv(oldPath, newPath, function (err) {
        if (err) throw err;

        res.redirect('/uploadedGifs');
      });
    });
  }
}

module.exports = ServiceUploadGifs;