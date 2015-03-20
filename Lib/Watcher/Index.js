

require('../Compiler/Index');
require('../Plugins/JS');
require('../Plugins/CSS');
require('../Plugins/Less');
require('../Plugins/Coffee');
require('../Plugins/SASS');
var
  FS = require('fs'),
  Path = require('path'),
  FSWatcher = require('node-fswatcher'),
  EventEmitter = require('events').EventEmitter;
class Watcher extends EventEmitter{
  constructor(Dir){
    this.Dir = FS.realpathSync(Dir);
    this.ManifestPath = `${Dir}${Path.sep}DeProc.json`;
  }
}
module.exports = Watcher;