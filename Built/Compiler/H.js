"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Path = require("path"),
    FS = require("fs");

var H = (function () {
  function H() {
    _classCallCheck(this, H);
  }

  _prototypeProperties(H, {
    Relative: {
      value: function Relative(Path1, Path2) {
        Path1 = Path1.split(Path.sep);
        Path2 = Path2.split(Path.sep);

        var RelativePath = [],
            I = null;
        while (Path1.length && Path2.length && Path1[0] === Path2[0]) {
          Path1.splice(Path1[0], 1);
          Path2.splice(Path2[0], 1);
        }
        for (I = 0; I < Path1.length; ++I) RelativePath.push("..");
        return RelativePath.length ? RelativePath.join(Path.sep) + Path.sep + Path2.join(Path.sep) : Path2.join(Path.sep);
      },
      writable: true,
      configurable: true
    },
    Clone: {
      value: function Clone(obj) {
        if (null == obj || "object" != typeof obj) {
          return obj;
        }var copy = obj.constructor();
        for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
      },
      writable: true,
      configurable: true
    },
    ABSPath: {
      value: function ABSPath(FilePath, FileDir) {
        if (FilePath.substr(0, 1) !== Path.sep && FilePath.substr(1, 1) !== ":") {
          // Windows Drive `D:\`
          FilePath = FileDir + Path.sep + FilePath;
        }
        return FilePath;
      },
      writable: true,
      configurable: true
    },
    FileDir: {
      value: function FileDir(FilePath) {
        FilePath = FilePath.split(Path.sep);
        FilePath.pop();
        return FilePath.join(Path.sep);
      },
      writable: true,
      configurable: true
    },
    FileRead: {
      value: function FileRead(FilePath) {
        return new Promise(function (Resolve, Reject) {
          FS.readFile(FilePath, function (Error, Content) {
            if (Error) {
              Reject(Error);
            } else {
              Resolve(Content.toString());
            }
          });
        });
      },
      writable: true,
      configurable: true
    },
    FileExists: {
      value: function FileExists(FilePath) {
        return new Promise(function (Resolve, Reject) {
          FS.exists(FilePath, function (Status) {
            if (Status) {
              Resolve();
            } else {
              Reject();
            }
          });
        });
      },
      writable: true,
      configurable: true
    },
    Each: {
      value: function Each(object, callback) {
        var i, ret;
        if (!object) {
          return;
        }try {
          if (typeof object.length !== "undefined" && typeof object !== "function") {
            if (typeof object.elements !== "undefined") {
              object = object.elements;
            }
            Array.prototype.forEach.call(object, function (element, index, array) {
              if (callback.call(element, element, index, array) === false) throw null;
            });
          } else {
            for (i in object) {
              if (object.hasOwnProperty(i)) {
                if (callback.call(object[i], object[i], i, object) === false) break;
              }
            }
          }
        } catch (e) {}
      },
      writable: true,
      configurable: true
    },
    Extend: {
      value: function Extend(Out) {
        Out = Out || {};
        H.Each(Array.prototype.slice.call(arguments, 1), function (obj) {
          H.Each(obj, function (val, key) {
            if (typeof val === "object" && val !== null) {
              Out[key] = Out[key] || {};
              H.Extend(Out[key], val);
            } else {
              Out[key] = val;
            }
          });
        });
        return Out;
      },
      writable: true,
      configurable: true
    }
  });

  return H;
})();

module.exports = H;