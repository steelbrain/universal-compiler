"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };



var Path = require("path"),
    FS = require("fs"),
    Promise = require("a-promise"),
    H = require("../H");
var CompilerBase = exports.CompilerBase = (function () {
  function CompilerBase() {
    _classCallCheck(this, CompilerBase);
  }

  CompilerBase.RegexLineInfo = /@([a-zA-z1-9-]*) "(.*)"/;
  _prototypeProperties(CompilerBase, null, {
    ParseLine: {
      value: function (FilePath, FileDir, Content, Opts, Line, Index) {
        return new Promise((function (Resolve, Reject) {
          var Valid = false,
              Info = null,
              Result = null;
          Line = Line.trim();
          this.Map.Comments.forEach(function (Comment) {
            if (Line.substr(0, Comment.length) === Comment) {
              Valid = true;
            }
          });
          if (!Valid) {
            return Resolve();
          }
          Info = CompilerBase.RegexLineInfo.exec(Line);
          if (!Info || Info.length !== 3 || !this.Map.Tags.hasOwnProperty(Info[1])) {
            return Resolve();
          }
          Result = this.Map.Tags[Info[1]](Info, Opts, Content, Line, Index, FileDir, FilePath);
          if (typeof Result !== "undefined") {
            if (Result.then) {
              Result.then(function (Result) {
                Content[Index] = Result;
                Resolve();
              }, Reject);
            } else {
              Content[Index] = Result;
              Resolve();
            }
          } else {
            Content[Index] = "";
            Resolve();
          }
        }).bind(this));
      },
      writable: true,
      configurable: true
    },
    Parse: {
      value: function (FilePath, Content, Opts) {
        Content = Content.split(/\r\n|\r|\n/);
        return new Promise((function (Resolve, Reject) {
          if (!Content.length) {
            return Resolve({ Opts: Opts, Content: Content });
          }
          var Promises = [],
              FileDir = Path.dirname(FilePath);
          if (Content[0].substr(0, 2) === "#!") {
            // Shebang
            Opts.Shebang = Content[0];
            Content[0] = "";
          }
          Content.forEach((function (Line, Index) {
            Promises.push(this.ParseLine(FilePath, FileDir, Content, Opts, Line, Index));
          }).bind(this));
          Promise.all(Promises).then(function () {
            Content = Content.join("\n");
            return Resolve({ Opts: Opts, Content: Content });
          }, Reject);
        }).bind(this));
      },
      writable: true,
      configurable: true
    }
  });

  return CompilerBase;
})();
Object.defineProperty(exports, "__esModule", {
  value: true
});