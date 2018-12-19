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

function convetSep(pathString) {
  let re = new RegExp("\\\\", 'g');
  return pathString.replace(re, "/");
}


module.exports = function(routesPath) {

  let files = getRouters(routesPath);
  let importRoot = path.join(appRoot, routesPath);
  
  for (let file of files) {

    let fileInfo  = path.parse(file);        
    fileInfo.dir  = convetSep(fileInfo.dir);

    let routePath = (fileInfo.name == "index") ? 
      fileInfo.dir :
      fileInfo.dir + '/' + fileInfo.name;    
    if (routePath[0] != "/") 
      routePath = '/'+ routePath;
  
    router.use(routePath, require(importRoot+"/"+file));
  }
  return router;
}
   
