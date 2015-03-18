

"use strict";
var FS = require('fs');
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
    this.Extension = Path.split('.').pop().toUpperCase();
    this.Path = Path;
  }
}
module.exports = FileInfo;