"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };



var Path = require("path");
var H = (function () {
  function H() {
    _classCallCheck(this, H);
  }

  _prototypeProperties(H, {
    Relative: {
      value: function (Path1, Path2) {
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
      value: function (obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
      },
      writable: true,
      configurable: true
    }
  });

  return H;
})();

module.exports = H;