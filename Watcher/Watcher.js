

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
    var Me = this;
    this.Dir = FS.realpathSync(Dir);

    Me.ManifestPath = `${Me.Dir}${Path.sep}DeProc.json`;

    CompilerH.FileExists(Me.ManifestPath).then(function(){
      CompilerH.FileRead(Me.ManifestPath).then(function(Contents){
        Me.Manifest = JSON.parse(Contents);
        Me.emit('Init');
      });
    },function(){
      WatcherH.Manifest(Dir).then(function(Manifest){
        FS.writeFile(Me.ManifestPath,JSON.stringify(Manifest));
        Me.Manifest = Manifest;
        Me.emit('Init');
      });
    });

    this.on('Init',Me.Watch.bind(Me));
  }
  Watch(){

  }
}
class WatcherControl{
  static Init(){
    global.uc_watcher_debug("WatcherControl::Init");
    WatcherH = WatcherH(WatcherControl);
  }
  static FileTypes:Object = {
    'JS': {Compress: false, Compiler: 'Babel', SourceMap: null, Output: null, IncludedIn:[], Watch:false},
    'JSX': {Compress: false, Compiler: 'Babel', SourceMap: null, Output: null, IncludedIn:[], Watch:true},
    'TAG': {Compress: false, Compiler: 'Babel', SourceMap: null, Output: null, IncludedIn:[], Watch:true},
    'COFFEE': {Compress: false, SourceMap: null, Output: null, IncludedIn:[], Watch:true},
    'LESS': {Compress: false, SourceMap: null, Output: null, IncludedIn:[], Watch:true},
    'CSS': {Compress: false, SourceMap: null, Output: null, IncludedIn:[], Watch:false}
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
WatcherControl.Init();
module.exports = {Watcher,WatcherControl};