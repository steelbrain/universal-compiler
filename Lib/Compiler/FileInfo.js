

"use strict";
var
  FS = require('fs'),
  FSPath = require('path');
class FileInfo{
  constructor(Path){
    try {
      this.Readable = FS.accessSync(Path, FS.R_OK) || true;
    } catch(err){
      this.Readable = false;
    }
    try {
      this.Writable = this.Readable && FS.accessSync(Path, FS.W_OK) || true;
    } catch(err){
      this.Writable = false;
    }
    this.Path = Path;
    this.FileName = Path.split(FSPath.sep).pop();
    this.Extension = Path.split('.').pop().toUpperCase();
    this.Directory = FS.realpathSync(FSPath.dirname(Path));
  }
}
module.exports = FileInfo;