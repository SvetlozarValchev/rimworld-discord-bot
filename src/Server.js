const express = require('express');
const session = require('express-session');
const auth = require('../auth.json');
const ServiceBase = require('./services/base');
const ServiceUploadStrips = require('./services/uploadStrips');
const ServiceUploadGifs = require('./services/uploadGifs');

const Server = {
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

    ServiceBase.setRoutes(app);
    ServiceUploadStrips.setRoutes(app);
    ServiceUploadGifs.setRoutes(app);

    app.listen(3000, function () {
      console.log('Server listening on port 3000!')
    });
  }
};

module.exports = Server;