const path = require("path");

const getAbsolutePath = (filePath = "./") =>
  path.resolve(process.cwd(), filePath);

const rootFolder = getAbsolutePath();
const srcFolder = getAbsolutePath("src/");
const libFolder = getAbsolutePath("lib/");
const entryFile = path.resolve(srcFolder, "index.ts");
const componentsFolder = path.resolve(srcFolder, "components");
const helpersFolder = path.resolve(srcFolder, "helpers");

module.exports = {
  rootFolder,
  srcFolder,
  distFolder: libFolder,
  entryFile,
  componentsFolder,
  helpersFolder
};
