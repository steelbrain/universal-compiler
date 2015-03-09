"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Path = require("path"),
    FS = require("fs"),
    Promise = require("a-promise"),
    H = require("../../Misc/H")();
module.exports = function (Compiler) {
  var CompilerBase = (function () {
    function CompilerBase() {
      _classCallCheck(this, CompilerBase);
    }

    CompilerBase.RegexLineInfo = /@([a-zA-z1-9-]*) "(.*)"/;
    CompilerBase.DefaultTags = [{
      Tags: ["Compiler-Output"],
      Callback: function Callback(Info, Opts, Content, Line, Index, FileDir) {
        Opts.TargetFile = H.ABSPath(Info[2], FileDir);
      }
    }, {
      Tags: ["Compiler-Sourcemap", "Compiler-SourceMap"],
      Callback: function Callback(Info, Opts, Content, Line, Index, FileDir) {
        Opts.SourceMap = H.ABSPath(Info[2], FileDir);
      }
    }, {
      Tags: ["Compiler-Compress"],
      Callback: function Callback(Info, Opts) {
        Opts.Compress = Info[2] === "true";
      }
    }, {
      Tags: ["Compiler-Include"],
      Callback: function Callback(Info, Opts, Content, Line, Index, FileDir) {
        Opts.IncludedFiles.push(H.ABSPath(Info[2], FileDir));
        return new Promise(function (Resolve, Reject) {
          Compiler.Compile(H.ABSPath(Info[2], FileDir)).then(function (Result) {
            Resolve(Result.Content);
          }, Reject);
        });
      }
    }];

    _prototypeProperties(CompilerBase, null, {
      ParseLine: {
        value: function ParseLine(FilePath, FileDir, Content, Opts, Line, Index) {
          return new Promise((function (Resolve, Reject) {
            var Valid = false,
                Info = null,
                Result = null,
                Tag = null;
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
            if (!Info || Info.length !== 3) {
              return Resolve();
            }
            this.Map.Tags.forEach(function (TagEntry) {
              if (TagEntry.Tags.indexOf(Info[1]) !== -1) {
                Tag = TagEntry;
              }
            });
            Tag || CompilerBase.DefaultTags.forEach(function (TagEntry) {
              if (TagEntry.Tags.indexOf(Info[1]) !== -1) {
                Tag = TagEntry;
              }
            });
            if (Tag === null) {
              return Resolve();
            }
            Result = Tag.Callback(Info, Opts, Content, Line, Index, FileDir, FilePath);
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
        value: function Parse(FilePath, Content, Opts) {
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

  return CompilerBase;
};