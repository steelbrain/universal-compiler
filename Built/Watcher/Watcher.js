"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Promise = require("a-promise");
var _require = require("../Compiler/Compiler");

var Compiler = _require.Compiler;
var H = require("../Misc/H");
var _require2 = require("events");

var EventEmitter = _require2.EventEmitter;
var Path = require("path");
var FS = require("fs");
var Chokidar = require("chokidar").FSWatcher;
var OptsProcess = require("./OptsProcess");
global.uc_watcher_debug = require("debug")("uc-watcher");

var Watcher = (function (EventEmitter) {
  function Watcher(Dir) {
    _classCallCheck(this, Watcher);

    global.uc_watcher_debug("Watcher::__construct");
    var Me = this;
    Dir = this.Dir = FS.realpathSync(Dir);

    Me.ManifestPath = "" + Me.Dir + "" + Path.sep + "DeProc.json";

    H.FileExists(Me.ManifestPath).then(function () {
      global.uc_watcher_debug("Watcher::__construct Manifest Exists");
      H.FileRead(Me.ManifestPath).then(function (Contents) {
        Me.Manifest = JSON.parse(Contents);
        Me.emit("Init");
      });
    }, function () {
      global.uc_watcher_debug("Watcher::__construct Manifest Doesn't Exist");
      H.Manifest(Dir).then(function (Manifest) {
        global.uc_watcher_debug("Watcher::__construct Writing Manifest");
        Me.Manifest = Manifest;
        Me.WriteManifest();
        Me.emit("Init");
      });
    });

    this.on("Init", this.Watch.bind(this));
  }

  _inherits(Watcher, EventEmitter);

  _prototypeProperties(Watcher, null, {
    WriteManifest: {
      value: function WriteManifest() {
        global.uc_watcher_debug("Watcher::WriteManifest");
        FS.writeFile(this.ManifestPath, JSON.stringify(this.Manifest, null, 2));
      },
      writable: true,
      configurable: true
    },
    Watch: {
      value: function Watch() {
        global.uc_watcher_debug("Watcher::Watch Watching files");
        this.ChokidarInst = new Chokidar();
        for (var Index in this.Manifest.Items.Info) {
          if (this.Manifest.Items.Info.hasOwnProperty(Index)) {
            if (this.Manifest.Items.Info[Index].Config.Watch) {
              this.ChokidarInst.add("" + this.Dir + "/" + this.Manifest.Items.Info[Index].Path);
            }
          }
        }
        this.ChokidarInst.on("change", this.OnChange.bind(this));
        this.ChokidarInst.on("unlink", this.OnRemove.bind(this));
      },
      writable: true,
      configurable: true
    },
    UnWatch: {
      value: function UnWatch() {
        global.uc_watcher_debug("Watcher::UnWatch");
        this.ChokidarInst.close();
        this.ChokidarInst = null;
      },
      writable: true,
      configurable: true
    },
    OnRemove: {
      value: function OnRemove(FilePath) {
        global.uc_watcher_debug("Watcher::OnRemove `" + FilePath + "`");
        var RelativeFilePath = FilePath.substr(this.Dir.length + 1);
        delete this.Manifest.Items.Info[RelativeFilePath];
        this.ChokidarInst.unwatch(FilePath);
        this.WriteManifest();
      },
      writable: true,
      configurable: true
    },
    OnChange: {
      value: function OnChange(FilePath) {
        global.uc_watcher_debug("Watcher::OnChange `" + FilePath + "`");
        var RelativeFilePath = FilePath.substr(this.Dir.length + 1),
            MyInfo = this.Manifest.Items.Info[RelativeFilePath],
            Temp = null,
            Me = this;
        Compiler.Compile(FilePath, MyInfo.Config).then(function (Result) {
          global.uc_watcher_debug("Watcher::OnChange Compiler::Compile Completed for `" + FilePath + "`");
          OptsProcess.Default(Me.Dir, MyInfo, MyInfo.Config, Result.Opts).then(function (UpdateDefault) {
            OptsProcess[MyInfo.Type](Me.Dir, MyInfo, MyInfo.Config, Result.Opts).then(function (UpdateSpecific) {
              if (UpdateDefault || UpdateSpecific) {
                Me.WriteManifest();
              }
              FS.writeFile("" + Me.Dir + "/" + MyInfo.Config.Output, Result.Content);
              global.uc_watcher_debug("Watcher::OnChange Wrote " + RelativeFilePath + " to " + MyInfo.Config.Output);
              if (MyInfo.Config.SourceMap !== null) {
                FS.writeFile("" + Me.Dir + "/" + MyInfo.Config.SourceMap, Result.SourceMap);
                global.uc_watcher_debug("Watcher::OnChange Wrote " + RelativeFilePath + " SourceMap to " + MyInfo.Config.SourceMap);
              }
            });
          });
        }, function (Err) {
          Me.LogError(Err);
        });
      },
      writable: true,
      configurable: true
    },
    LogError: {
      value: function LogError(Err) {
        console.log(Err);
      },
      writable: true,
      configurable: true
    }
  });

  return Watcher;
})(EventEmitter);

var WatcherControl = (function () {
  function WatcherControl() {
    _classCallCheck(this, WatcherControl);
  }

  WatcherControl.Version = "0.0.1";
  WatcherControl.FileTypes = {
    JS: { Compress: false, Compiler: "Babel", SourceMap: null, IncludedIn: [], Watch: false, Transpile: false },
    JSX: { Compress: false, Compiler: "Babel", SourceMap: null, IncludedIn: [], Watch: true, Transpile: true },
    TAG: { Compress: false, Compiler: "Babel", SourceMap: null, IncludedIn: [], Watch: true, Transpile: true },
    COFFEE: { Compress: false, SourceMap: null, IncludedIn: [], Watch: true },
    LESS: { Compress: false, SourceMap: null, IncludedIn: [], Watch: true },
    CSS: { Compress: false, SourceMap: null, IncludedIn: [], Watch: false }
  };
  WatcherControl.FileTypesProcessedExt = {
    JS: "js",
    JSX: "js",
    TAG: "js",
    COFFEE: "js",
    LESS: "css",
    CSS: "css"
  };

  _prototypeProperties(WatcherControl, {
    Init: {
      value: function Init() {
        global.uc_watcher_debug("WatcherControl::Init");
        H = H(WatcherControl);
      },
      writable: true,
      configurable: true
    },
    Watch: {
      value: function Watch(Dir) {
        if (H.FileExists(Dir)) {
          global.uc_watcher_debug("WatcherControl::Watch Initiating new Watcher");
          return new Watcher(Dir);
        } else {
          global.uc_watcher_debug("WatcherControl::Watch Not Found " + Dir);
          throw new Error("The Path provided Doesn't exist");
        }
      },
      writable: true,
      configurable: true
    }
  });

  return WatcherControl;
})();

WatcherControl.Init();
module.exports = { Watcher: Watcher, WatcherControl: WatcherControl };