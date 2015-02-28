"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Promise = require("a-promise");
var WatcherH = require("./H");
var _require = require("../Compiler/Compiler");

var Compiler = _require.Compiler;
var CompilerH = require("../Compiler/H");
var _require2 = require("events");

var EventEmitter = _require2.EventEmitter;
var Path = require("path");
var FS = require("fs");
var Chokidar = new (require("chokidar").FSWatcher)();
global.uc_watcher_debug = require("debug")("uc-watcher");

var Watcher = (function (EventEmitter) {
  function Watcher(Dir) {
    _classCallCheck(this, Watcher);

    global.uc_watcher_debug("Watcher::__construct");
    var Me = this;
    this.Dir = FS.realpathSync(Dir);

    Me.ManifestPath = "" + Me.Dir + "" + Path.sep + "DeProc.json";

    CompilerH.FileExists(Me.ManifestPath).then(function () {
      global.uc_watcher_debug("Watcher::__construct Manifest Exists");
      CompilerH.FileRead(Me.ManifestPath).then(function (Contents) {
        Me.Manifest = JSON.parse(Contents);
        Me.emit("Init");
      });
    }, function () {
      global.uc_watcher_debug("Watcher::__construct Manifest Doesn't Exist");
      WatcherH.Manifest(Dir).then(function (Manifest) {
        global.uc_watcher_debug("Watcher::__construct Writing Manifest");
        Me.Manifest = Manifest;
        Me.WriteManifest();
        Me.emit("Init");
      });
    });

    this.on("Init", this.Watch.bind(this));
    Chokidar.on("change", this.OnChange.bind(this));
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
        for (var Index in this.Manifest.Items.Info) {
          if (this.Manifest.Items.Info.hasOwnProperty(Index)) {
            if (this.Manifest.Items.Info[Index].Config.Watch) {
              Chokidar.add(this.Manifest.Items.Info[Index].Path);
            }
          }
        }
      },
      writable: true,
      configurable: true
    },
    OnChange: {
      value: function OnChange(FilePath) {
        global.uc_watcher_debug("Watcher::OnChange `" + FilePath + "`");
        var MyInfo = this.Manifest.Items.Info[FilePath],
            Temp = null;
        Compiler.Compile(FilePath, { SourceMap: this.Manifest.Items.Info[FilePath].SourceMap }).then((function (Result) {
          global.uc_watcher_debug("Watcher::OnChange Compiled `" + FilePath + "`");
          if (Result.Opts.TargetFile !== null && MyInfo.Config.Output !== Result.Opts.TargetFile) {
            if (!FS.existsSync(Result.Opts.TargetFile)) {
              FS.writeFileSync(Result.Opts.TargetFile, "");
            }
            Temp = FS.realpathSync(Result.Opts.TargetFile);
            if (Temp !== MyInfo.Config.Output) {
              MyInfo.Config.Output = Temp;
              this.WriteManifest();
            }
          }
          if (Result.Opts.SourceMap !== null && MyInfo.Config.SourceMap !== Result.Opts.SourceMap) {
            if (!FS.existsSync(Result.Opts.SourceMap)) {
              FS.writeFileSync(Result.Opts.SourceMap, "");
            }
            Temp = FS.realpathSync(Result.Opts.SourceMap);
            if (Temp !== MyInfo.Config.SourceMap) {
              MyInfo.Config.SourceMap = Temp;
              this.WriteManifest();
            }
          }
          FS.writeFile(MyInfo.Config.Output, Result.Content);
          global.uc_watcher_debug("Watcher::OnChange Wrote `" + FilePath + "` to `" + MyInfo.Config.Output + "`");
          if (MyInfo.Config.SourceMap !== null) {
            FS.writeFile(MyInfo.Config.SourceMap, Result.SourceMap);
            global.uc_watcher_debug("Watcher::OnChange Wrote `" + FilePath + "` SourceMap to `" + MyInfo.Config.SourceMap + "`");
          }
        }).bind(this));
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
    JS: { Compress: false, Compiler: "Babel", SourceMap: null, IncludedIn: [], Watch: false },
    JSX: { Compress: false, Compiler: "Babel", SourceMap: null, IncludedIn: [], Watch: true },
    TAG: { Compress: false, Compiler: "Babel", SourceMap: null, IncludedIn: [], Watch: true },
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
        WatcherH = WatcherH(WatcherControl);
      },
      writable: true,
      configurable: true
    },
    Watch: {
      value: function Watch(Dir) {
        if (CompilerH.FileExists(Dir)) {
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