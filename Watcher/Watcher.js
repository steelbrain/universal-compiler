

// @Compiler-Output "../Built/Watcher/Watcher.js"
var
  Promise = require('a-promise'),
  WatcherH = require('./H'),
  Compiler = require('../Compiler/Compiler'),
  CompilerH = require('../Compiler/H'),
  {EventEmitter} = require('events'),
  Path = require('path'),
  FS = require('fs'),
  Chokidar = require('chokidar');
global.uc_watcher_debug = require('debug')('uc-watcher');
class Watcher extends EventEmitter{
  Dir:String;
  Manifest:Object;
  ManifestPath:String;
  constructor(Dir:String){
    this.Dir = FS.realpathSync(Dir);
    this.ManifestPath = `${this.Dir}${Path.sep}DeProc.json`;
    CompilerH.FileExists(this.ManifestPath).then(function(){
      CompilerH.FileRead(this.ManifestPath).then(function(Contents){
        this.Manifest = JSON.parse(Contents);
        this.emit('Init');
      }.bind(this));
    }.bind(this)).catch(function(){
      WatcherH.Manifest(Dir).then(function(Manifest){
        FS.writeFile(this.ManifestPath,JSON.stringify(Manifest));
        this.Manifest = Manifest;
        this.emit('Init');
      }.bind(this));
    }.bind(this));
    this.on('Init',this.Watch.bind(this));
  }
  Watch(){

  }
}
class WatcherControl{
  static FileTypes:Object = {
    'JS': {Compress: false, Compiler: 'Babel', SourceMap: null, Output: null, IncludedIn:[]},
    'JSX': {Compress: false, Compiler: 'Babel', SourceMap: null, Output: null, IncludedIn:[]},
    'TAG': {Compress: false, Compiler: 'Babel', SourceMap: null, Output: null, IncludedIn:[]},
    'COFFEE': {Compress: false, SourceMap: null, Output: null, IncludedIn:[]},
    'LESS': {Compress: false, SourceMap: null, Output: null, IncludedIn:[]},
    'CSS': {Compress: false, SourceMap: null, Output: null, IncludedIn:[]}
  };
  static Watch(Dir:String){
    if(CompilerH.FileExists(Dir)){
      global.uc_watcher_debug("WatcherControl::Watch Initiating new Watcher");
      return new Watcher(Dir);
    } else {
      global.uc_watcher_debug(`WatcherControl::Watch Not Found ${Dir}`);
      throw new Error("The Path provided Doesn't exist");
    }
  }
}
WatcherH.Init(WatcherControl);
module.exports = {Watcher,WatcherControl};