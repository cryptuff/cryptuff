const autoprefixer = require("autoprefixer");
const flexbugs = require("postcss-flexbugs-fixes");

module.exports = [
  autoprefixer({
    grid: true
  }),
  flexbugs
];
