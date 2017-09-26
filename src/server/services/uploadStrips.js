const fs = require('fs');
const mv = require('mv');
const path = require('path');
const formidable = require('formidable');
const uniqueSlug = require('unique-slug');

const ServiceBase = require('./base');

class ServiceUploadStrips {
  static setRoutes(app) {
    app.get('/uploadStrip', ServiceUploadStrips.routeUploadStrip);

    app.get('/uploadedStrips', ServiceUploadStrips.routeUploadedStrips);

    app.get('/fetchUploadedStrips/:type', ServiceUploadStrips.routeFetchUploadedStrips);

    app.get('/viewStrip/:type/:strip', ServiceUploadStrips.routeViewStrip);

    app.get('/deleteStrip/:type/:strip', ServiceUploadStrips.routeDeleteStrip);

    app.post('/uploadStripFile', ServiceUploadStrips.routeUploadStripFile);
  }

  static routeUploadStrip(req, res) {
    if (!ServiceBase.authCheck('/uploadStrip', req, res)) {
      return;
    }

    res.sendFile(path.join(ServiceBase.wwwPath, 'uploadStrip.html'));
  };

  static routeUploadedStrips(req, res) {
    if (!ServiceBase.authCheck('/uploadedStrips', req, res)) {
      return;
    }

    res.sendFile(path.join(ServiceBase.wwwPath, 'uploadedStrips.html'));
  }

  static routeFetchUploadedStrips(req, res) {
    if (!ServiceBase.authCheck(`/fetchUploadedStrips/${req.params.type}`, req, res)) {
      return;
    }

    if (req.params.type !== 'begin' && req.params.type !== 'middle' && req.params.type !== 'end') {
      res.send('Invalid type');
      return;
    }

    fs.readdir(path.join(ServiceBase.stripsPath, req.params.type), (err, strips) => {
      const stripsCollection = [];

      strips.forEach(strip => {
        stripsCollection.push(strip);
      });

      res.send(JSON.stringify({strips: stripsCollection}));
    });
  }

  static routeViewStrip(req, res) {
    if (!ServiceBase.authCheck(`/viewStrip/${req.params.type}/${req.params.strip}`, req, res)) {
      return;
    }

    if (req.params.type !== 'begin' && req.params.type !== 'middle' && req.params.type !== 'end') {
      res.send('Invalid type');
      return;
    }

    if (!ServiceBase.regexValidFilename.test(req.params.strip)) {
      res.send('Invalid Strip name');
      return;
    }

    const filePath = path.join(ServiceBase.stripsPath, req.params.type, req.params.strip);

    res.sendFile(filePath, function (err) {
      if (err) {
        res.status(404)
          .send('Not found');
      }
    });
  }

  static routeDeleteStrip(req, res) {
    if (!ServiceBase.authCheck(`/deleteStrip/${req.params.type}/${req.params.strip}`, req, res)) {
      return;
    }

    if (req.params.type !== 'begin' && req.params.type !== 'middle' && req.params.type !== 'end') {
      res.send('Invalid type');
      return;
    }

    if (!ServiceBase.regexValidFilename.test(req.params.strip)) {
      res.send('Invalid Strip name');
      return;
    }

    const filePath = path.join(ServiceBase.stripsPath, req.params.type, req.params.strip);

    fs.unlink(filePath, function (err) {
      if (err) {
        res.status(404)
          .send('Not found');
      } else {
        res.redirect('/uploadedStrips');
      }
    })
  }

  static routeUploadStripFile(req, res) {
    if (!ServiceBase.authCheck('/uploadStrip', req, res)) {
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
      const newPath = path.join(ServiceBase.stripsPath, fields.type, `${uniqueSlug()}_${imgFile.name}`);

      mv(oldPath, newPath, function (err) {
        if (err) throw err;

        res.redirect('/uploadedStrips');
      });
    });
  }
}

module.exports = ServiceUploadStrips;