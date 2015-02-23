"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };



var Promise = require("a-promise"),
    WatcherH = require("./H"),
    Compiler = require("../Compiler/Compiler"),
    CompilerH = require("../Compiler/H");
var Watcher = exports.Watcher = (function () {
  function Watcher() {
    _classCallCheck(this, Watcher);
  }

  _prototypeProperties(Watcher, {
    Watch: {
      value: function (Path) {
        console.log(Path);
      },
      writable: true,
      configurable: true
    }
  });

  return Watcher;
})();
Object.defineProperty(exports, "__esModule", {
  value: true
});