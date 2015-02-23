"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Promise = require("a-promise");
var UglifyCSS = null;
var LESS = null;
var H = require("../H");
var Path = require("path");
var _require = require("../Compiler");

var Compiler = _require.Compiler;
var CompilerBase = require("../Abstract/Compiler-Base").CompilerBase;
var CompilerLESS = (function (CompilerBase) {
  function CompilerLESS() {
    this.Map = {
      Comments: ["//", "/*"],
      Tags: {
        "Compiler-Output": function (Info, Opts, Content, Line, Index, FileDir) {
          Opts.TargetFile = H.ABSPath(Info[2], FileDir);
        },
        "Compiler-Compress": function (Info, Opts) {
          Opts.Compress = Info[2] === "true";
        },
        "Compiler-SourceMap": function (Info, Opts, Content, Line, Index, FileDir) {
          Opts.SourceMap = H.ABSPath(Info[2], FileDir);
        },
        "Compiler-Append": function (Info, Opts, Content, Line, Index, FileDir) {
          return new Promise(function (Resolve, Reject) {
            Compiler.Compile(H.ABSPath(Info[2], FileDir)).then(function (Result) {
              Resolve(Result.Content);
            }, Reject);
          });
        }
      }
    };

    _classCallCheck(this, CompilerLESS);

    if (CompilerBase != null) {
      CompilerBase.apply(this, arguments);
    }
  }

  _inherits(CompilerLESS, CompilerBase);

  _prototypeProperties(CompilerLESS, null, {
    Process: {
      value: function Process(FilePath, Opts) {
        return new Promise((function (Resolve, Reject) {
          H.FileRead(FilePath).then((function (Content) {
            this.Parse(FilePath, Content, Opts).then((function (Parsed) {
              var ToReturn = { Content: Parsed.Content, SourceMap: "", Opts: Parsed.Opts };
              this.ProcessLESS(FilePath, ToReturn, Parsed).then((function () {
                if (Opts.Compress) {
                  this.ProcessUglify(FilePath, ToReturn, Parsed);
                }
                Resolve(ToReturn);
              }).bind(this));
            }).bind(this), Reject);
          }).bind(this), Reject);
        }).bind(this));
      },
      writable: true,
      configurable: true
    },
    ProcessLESS: {
      value: function ProcessLESS(FilePath, ToReturn, _ref) {
        var Opts = _ref.Opts;
        var Content = _ref.Content;

        return new Promise(function (Resolve, Reject) {
          var Temp = null,
              SourceMapURL = Opts.SourceMap !== null ? H.Relative(H.FileDir(Opts.TargetFile), Opts.SourceMap) : null,
              FileDir = Path.dirname(FilePath);
          LESS = LESS || require("less");
          LESS.render(Content, {
            sourceMap: true,
            filename: FilePath,
            paths: [FileDir],
            compress: Opts.Compress
          }).then(function (LeResult) {
            ToReturn.Content = LeResult.css;
            if (Opts.SourceMap !== null) {
              Temp = { Map: JSON.parse(LeResult.map), Files: [], SourceMapDir: Opts.SourceMap.split(Path.sep) };
              Temp.SourceMapDir.pop();
              Temp.SourceMapDir = Temp.SourceMapDir.join(Path.sep);
              Temp.Map.sources.forEach(function (File) {
                Temp.Files.push(H.Relative(Temp.SourceMapDir, File));
              });
              Temp.Map.sources = Temp.Files;
              ToReturn.SourceMap = JSON.stringify(Temp.Map);
              ToReturn.Content += "/*# sourceMappingURL=" + SourceMapURL + " */";
            }
            Resolve();
          }, Reject);
        });
      },
      writable: true,
      configurable: true
    },
    ProcessUglify: {
      value: function ProcessUglify(FilePath, ToReturn, _ref) {
        var Opts = _ref.Opts;
        var Content = _ref.Content;

        UglifyCSS = UglifyCSS || new (require("clean-css"))({ sourceMap: true });
        var Output = UglifyCSS.minify(Content);
        ToReturn.Content = Output.styles;
        ToReturn.SourceMap = "";
      },
      writable: true,
      configurable: true
    }
  });

  return CompilerLESS;
})(CompilerBase);

module.exports = CompilerLESS;