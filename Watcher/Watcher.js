

// @Compiler-Output "../Built/Watcher/Watcher.js"
var
  Promise = require('a-promise'),
  WatcherH = require('./H'),
  {Compiler} = require('../Compiler/Compiler'),
  CompilerH = require('../Compiler/H'),
  {EventEmitter} = require('events'),
  Path = require('path'),
  FS = require('fs'),
  Chokidar = new (require('chokidar').FSWatcher),
  OptsProcess = require('./OptsProcess');
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
        Me.Manifest = Manifest;
        Me.WriteManifest();
        Me.emit('Init');
      });
    });

    this.on('Init',this.Watch.bind(this));
    Chokidar.on('change', this.OnChange.bind(this));
  }
  WriteManifest():void{
    global.uc_watcher_debug("Watcher::WriteManifest");
    FS.writeFile(this.ManifestPath,JSON.stringify(this.Manifest, null, 2));
  }
  Watch():void{
    global.uc_watcher_debug("Watcher::Watch Watching files");
    for(var Index in this.Manifest.Items.Info){
      if(this.Manifest.Items.Info.hasOwnProperty(Index)){
        if(this.Manifest.Items.Info[Index].Config.Watch){
          Chokidar.add(`${this.Dir}/${this.Manifest.Items.Info[Index].Path}`);
        }
      }
    }
  }
  OnChange(FilePath:String):void{
    global.uc_watcher_debug("Watcher::OnChange `" + FilePath + "`");
    var
      RelativeFilePath = FilePath.substr(this.Dir.length + 1),
      MyInfo = this.Manifest.Items.Info[RelativeFilePath],
      Temp = null,
      Me = this;
    Compiler.Compile(FilePath, MyInfo.Config).then(function(Result){
      global.uc_watcher_debug("Watcher::OnChange Compiler::Compile Completed for `" + FilePath + "`");
      OptsProcess.Default(Me.Dir, MyInfo, MyInfo.Config, Result.Opts).then(function(UpdateDefault){
        OptsProcess[MyInfo.Type](Me.Dir, MyInfo, MyInfo.Config, Result.Opts).then(function(UpdateSpecific){
          if(UpdateDefault || UpdateSpecific) {
            Me.WriteManifest();
          }
          FS.writeFile(`${Me.Dir}/${MyInfo.Config.Output}`, Result.Content);
          global.uc_watcher_debug(`Watcher::OnChange Wrote ${RelativeFilePath} to ${MyInfo.Config.Output}`);
          if(MyInfo.Config.SourceMap !== null){
            FS.writeFile(`${Me.Dir}/${MyInfo.Config.SourceMap}`, Result.SourceMap);
            global.uc_watcher_debug(`Watcher::OnChange Wrote ${RelativeFilePath} SourceMap to ${MyInfo.Config.SourceMap}`);
          }
        });
      });
    },function(Err){
      Me.LogError(Err);
    });
  }
  LogError(Err){
    console.log(Err);
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