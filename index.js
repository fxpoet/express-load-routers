let fs   = require('fs');
let path = require('path');
let resolve = require('path').resolve;
let express = require('express');
let appRoot = require('app-root-path').toString();

let router = express.Router();

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
          foundFiles.push(path.relative(rootDir, resolve(fullPath)));
        }
      }

    });
  }

  walkDir(dirPath);
  return foundFiles;
}

function convertSep(pathString) {
  let re = new RegExp("\\\\", 'g');
  return pathString.replace(re, "/");
}

module.exports = function(routesPath) {

  let files = getRouters(routesPath);
  let importRoot = path.join(appRoot, routesPath);
  let indexRouters = {};

  files.sort((item)=> (item.indexOf(path.sep+'index.js')<0) );

  for (let file of files) {

    let fileInfo  = path.parse(file);
    fileInfo.dir  = convertSep(fileInfo.dir);

    let routePath = (fileInfo.name == "index") ?
      fileInfo.dir :
      fileInfo.dir + '/' + fileInfo.name;

    if (routePath[0] != "/")
      routePath = '/'+ routePath;

    if (indexRouters[fileInfo.dir]) {
      indexRouters[fileInfo.dir].use('/'+fileInfo.name, require(importRoot+"/"+file));
    } else {
      let subRouter = require(importRoot+"/"+file);
      indexRouters[fileInfo.dir] = subRouter;
      router.use(routePath, subRouter);
    }

  }
  return router;
}
