"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Promise = require("a-promise");
var WatcherH = require("./H");
var Compiler = require("../Compiler/Compiler");
var CompilerH = require("../Compiler/H");
var _require = require("events");

var EventEmitter = _require.EventEmitter;
var Path = require("path");
var FS = require("fs");
global.uc_watcher_debug = require("debug")("uc-watcher");

var Watcher = (function (EventEmitter) {
  function Watcher(Dir) {
    _classCallCheck(this, Watcher);

    this.Dir = FS.realpathSync(Dir);
    this.ManifestPath = this.Dir + Path.sep + "DeProc.json";
    CompilerH.FileExists(this.ManifestPath).then((function () {
      CompilerH.FileRead(this.ManifestPath).then((function (Contents) {
        this.Manifest = JSON.parse(Contents);
        this.emit("Init");
      }).bind(this));
    }).bind(this))["catch"]((function () {
      WatcherH.Manifest(Dir).then((function (Manifest) {
        FS.writeFile(this.ManifestPath, JSON.stringify(Manifest));
        this.Manifest = Manifest;
        this.emit("Init");
      }).bind(this));
    }).bind(this));
  }

  _inherits(Watcher, EventEmitter);

  return Watcher;
})(EventEmitter);

var WatcherControl = (function () {
  function WatcherControl() {
    _classCallCheck(this, WatcherControl);
  }

  WatcherControl.FileTypes = {
    JS: { Compress: false, Compiler: ["Babel", "ReactTools", "Riot"], SourceMap: null },
    JSX: { Compress: false, Compiler: ["Babel", "ReactTools", "Riot"], SourceMap: null },
    TAG: { Compress: false, Compiler: ["Riot"], SourceMap: null },
    COFFEE: { Compress: false, SourceMap: null },
    LESS: { Compress: false, SourceMap: null },
    CSS: { Compress: false, SourceMap: null }
  };

  _prototypeProperties(WatcherControl, {
    Watch: {
      value: function Watch(Dir) {
        if (CompilerH.FileExists(Dir)) {
          global.uc_watcher_debug("WatcherControl::Watch Initiating new Watcher");
          return new Watcher(Dir);
        } else {
          global.uc_watcher_debug("WatcherControl::Watch Doesn't exist " + Dir);
          throw new Error("The Path provided Doesn't exist");
        }
      },
      writable: true,
      configurable: true
    }
  });

  return WatcherControl;
})();

WatcherH.Init(WatcherControl);
module.exports = { Watcher: Watcher, WatcherControl: WatcherControl };