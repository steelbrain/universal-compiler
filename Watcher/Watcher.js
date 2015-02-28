

// @Compiler-Output "../Built/Watcher/Watcher.js"
var
  Promise = require('a-promise'),
  WatcherH = require('./H'),
  {Compiler} = require('../Compiler/Compiler'),
  CompilerH = require('../Compiler/H'),
  {EventEmitter} = require('events'),
  Path = require('path'),
  FS = require('fs'),
  Chokidar = new (require('chokidar').FSWatcher);
global.uc_watcher_debug = require('debug')('uc-watcher');
class Watcher extends EventEmitter{
  Dir:String;
  Manifest:Object;
  ManifestPath:String;
  constructor(Dir:String){
    global.uc_watcher_debug("Watcher::__construct");
    var Me = this;
    this.Dir = FS.realpathSync(Dir);

    Me.ManifestPath = `${Me.Dir}${Path.sep}DeProc.json`;

    CompilerH.FileExists(Me.ManifestPath).then(function(){
      global.uc_watcher_debug("Watcher::__construct Manifest Exists");
      CompilerH.FileRead(Me.ManifestPath).then(function(Contents){
        Me.Manifest = JSON.parse(Contents);
        Me.emit('Init');
      });
    },function(){
      global.uc_watcher_debug("Watcher::__construct Manifest Doesn't Exist");
      WatcherH.Manifest(Dir).then(function(Manifest){
        global.uc_watcher_debug("Watcher::__construct Writing Manifest");
        FS.writeFile(Me.ManifestPath,JSON.stringify(Manifest));
        Me.Manifest = Manifest;
        Me.emit('Init');
      });
    });

    this.on('Init',this.Watch.bind(this));
    Chokidar.on('change', this.OnChange.bind(this));
  }
  Watch():void{
    global.uc_watcher_debug("Watcher::Watch Watching " + this.Manifest.Items.Info.length + " files");
    this.Manifest.Items.Info.forEach(function(Item){
      Chokidar.add(Item.Path);
    });
  }
  OnChange(FilePath:String):void{
    global.uc_watcher_debug("Watcher::OnChange `" + FilePath + "`");
    Compiler.Compile(FilePath).then(function(Result){
      console.log(Result);
    });
  }
}
class WatcherControl{
  static Version = '0.0.1';
  static Init(){
    global.uc_watcher_debug("WatcherControl::Init");
    WatcherH = WatcherH(WatcherControl);
  }
  static FileTypes:Object = {
    'JS': {Compress: false, Compiler: 'Babel', SourceMap: null, IncludedIn:[], Watch:false},
    'JSX': {Compress: false, Compiler: 'Babel', SourceMap: null, IncludedIn:[], Watch:true},
    'TAG': {Compress: false, Compiler: 'Babel', SourceMap: null, IncludedIn:[], Watch:true},
    'COFFEE': {Compress: false, SourceMap: null, IncludedIn:[], Watch:true},
    'LESS': {Compress: false, SourceMap: null, IncludedIn:[], Watch:true},
    'CSS': {Compress: false, SourceMap: null, IncludedIn:[], Watch:false}
  };
  static FileTypesProcessedExt:Object = {
    'JS': 'js',
    'JSX': 'js',
    'TAG': 'js',
    'COFFEE': 'js',
    'LESS': 'css',
    'CSS': 'css'
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