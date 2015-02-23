

// @Compiler-Output "../Built/Watcher/Watcher.js"
var
  Promise = require('a-promise'),
  WatcherH = require('./H'),
  Compiler = require('../Compiler/Compiler'),
  CompilerH = require('../Compiler/H'),
  {EventEmitter} = require('events'),
  Path = require('path'),
  FS = require('fs');
global.uc_watcher_debug = require('debug')('uc-watcher');
class Watcher extends EventEmitter{
  Dir:String;
  Manifest:Object;
  ManifestPath:String;
  constructor(Dir:String){
    this.Dir = FS.realpathSync(Dir);
    this.ManifestPath = this.Dir + Path.sep + 'DeProc.json';
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
  }
}
class WatcherControl{
  static FileTypes:Object = {
    'JS': {Compress: false, Compiler: ['Babel','ReactTools','Riot'], SourceMap: null},
    'JSX': {Compress: false, Compiler: ['Babel','ReactTools','Riot'], SourceMap: null},
    'TAG': {Compress: false, Compiler: ['Riot'], SourceMap: null},
    'COFFEE': {Compress: false, SourceMap: null},
    'LESS': {Compress: false, SourceMap: null},
    'CSS': {Compress: false, SourceMap: null}
  };
  static Watch(Dir:String){
    if(CompilerH.FileExists(Dir)){
      global.uc_watcher_debug("WatcherControl::Watch Initiating new Watcher");
      return new Watcher(Dir);
    } else {
      global.uc_watcher_debug("WatcherControl::Watch Doesn't exist " + Dir);
      throw new Error("The Path provided Doesn't exist");
    }
  }
}
WatcherH.Init(WatcherControl);
module.exports = {Watcher,WatcherControl};