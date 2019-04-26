// const proxy = require('http-proxy-middleware');
var cors = require("cors");

module.exports = function(app) {
  // app.use(proxy('/kraken', { target: 'https://api.kraken.com/' }));
  app.use(cors());
};
