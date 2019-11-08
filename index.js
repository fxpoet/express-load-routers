let fs   = require('fs');
let path = require('path');
let resolve = require('path').resolve;
let express = require('express');
let appRoot = require('app-root-path').toString();

let router = express.Router();

function convertSep(pathString) {
  if (path.sep == "/") return pathString;
  let re = new RegExp("\\\\", 'g');
  return pathString.replace(re, "/");
}

function getRouters(dirPath) {

  let rootDir = resolve(dirPath);
  let foundFiles = [];

  function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
      let fullPath = path.join(dir, file);

      if (fs.lstatSync(fullPath).isDirectory())
        walkDir(fullPath);

      else {
        if (file[0] != "_") {
          foundFiles.push(  convertSep(path.relative(rootDir, resolve(fullPath))) );
        }
      }
    });
  }

  walkDir(dirPath);
  return foundFiles;
}

module.exports = function(routesPath) {

  let files = getRouters(routesPath);
  let importRoot = path.join(appRoot, routesPath) + '/';
  let indexRouters = {};

  let indexs   = files.filter(i => ((i.indexOf('/index.js') > -1) || (i == 'index.js') )).sort( (a,b) => (a.length - b.length) )
  let subFiles = files.filter(i => ((i.indexOf('/index.js') == -1) && (i != 'index.js') )).sort( (a,b) => (a.length - b.length) )

  for (let file of indexs) {
    let subRouter    = require(importRoot + file);
    let parentRouter = router;
    let fileInfo     = path.parse(file);
    let fileDir      = fileInfo.dir || '/';

    let fileParent = path.dirname(fileDir);
    let routePath  = '/'+path.basename(fileDir) || '/';

    if (fileParent == '.') fileParent = "/";

    if (indexRouters[fileParent]) {
      parentRouter = indexRouters[fileParent];
    }

    parentRouter.use(routePath, subRouter);
    indexRouters[fileDir] = subRouter;
  }

  for (let file of subFiles) {
    let subRouter    = require(importRoot + file);
    let parentRouter = router;
    let fileInfo     = path.parse(file);
    let fileDir      = fileInfo.dir || '/';

    let fileParent = fileDir;
    let routePath  = '/'+fileInfo.name || '/';

    if (indexRouters[fileParent]) {
      parentRouter = indexRouters[fileParent];
    }

    parentRouter.use(routePath, subRouter);
  }

  return router;
}
