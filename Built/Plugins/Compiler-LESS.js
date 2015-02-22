"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };



var Promise = require("a-promise"),
    LESS = null,
    FS = require("fs"),
    Path = require("path"),
    H = require("../H"),
    Compiler = null;
var CompilerLESS = (function () {
  function CompilerLESS() {
    _classCallCheck(this, CompilerLESS);
  }

  CompilerLESS.RegexAppend = /@(codekit-append|prepros-append|Compiler-Append)/;
  CompilerLESS.RegexOutput = /@Compiler-Output/;
  CompilerLESS.RegexSourceMap = /@Compiler-Sourcemap/;
  CompilerLESS.RegexCompress = /@Compiler-Compress/;
  CompilerLESS.RegexExtract = /".*"/;
  _prototypeProperties(CompilerLESS, {
    init: {
      value: function (LeCompiler) {
        Compiler = LeCompiler;
      },
      writable: true,
      configurable: true
    },
    ExtractValue: {
      value: function (Line) {
        return new Promise(function (resolve, reject) {
          var Result = CompilerLESS.RegexExtract.exec(Line);
          if (!Result.length) {
            return reject(); // Skip empty "@codekit-append"
          }
          Result = Result[0].substr(1, Result[0].length - 2);
          resolve(Result);
        });
      },
      writable: true,
      configurable: true
    },
    ExtractPath: {
      value: function (Line, FileDir) {
        return new Promise(function (resolve, reject) {
          CompilerLESS.ExtractValue(Line).then(function (Result) {
            if (Result.substr(0, 1) !== Path.sep && Result.substr(1, 1) !== ":") {
              // Windows Drive `D:\`
              Result = FileDir + Path.sep + Result;
            }
            resolve(Result);
          }, reject);
        });
      },
      writable: true,
      configurable: true
    },
    ParseAppend: {
      value: function (Line, FileDir, FilePath, HasSourceMap) {
        return new Promise(function (resolve, reject) {
          CompilerLESS.ExtractPath(Line, FileDir).then(function (Result) {
            if (!HasSourceMap) {
              // Lets append it if we aren't giving em any source maps, EH!
              Compiler.Compile(Result).then(function (Result) {
                resolve(Result.Content);
              }, reject);
            } else {
              FS.readFile(Result, function (Error, LeContent) {
                if (Error) {
                  return reject("The File '" + Result + " doesn't exist, It was imported in " + FilePath + "'");
                }
                resolve(LeContent.toString());
              });
            }
          }, reject);
        });
      },
      writable: true,
      configurable: true
    },
    Parse: {
      value: function (FilePath, Content, Opts) {
        return new Promise(function (resolve, reject) {
          var ToReturn = { Content: "", Opts: Opts },
              FileDir = Path.dirname(FilePath),
              Promises = [];
          Content.forEach(function (Line, LeIndex) {
            var Index;
            if (Line.indexOf("//") !== -1) {
              Promises.push(new Promise(function (LineResolve, LineReject) {
                Line = Line.trim();
                Index = Line.indexOf("//");
                if (Index === -1 || Index !== 0) {
                  return LineResolve(); // Ignore non-commented lines or lines with stuff + comments
                }
                if (CompilerLESS.RegexAppend.test(Line)) {
                  CompilerLESS.ParseAppend(Line, FileDir, FilePath, !!Opts.SourceMap).then(function (Result) {
                    Content[LeIndex] = Result;
                    LineResolve();
                  }, LineReject);
                } else if (CompilerLESS.RegexOutput.test(Line)) {
                  CompilerLESS.ExtractPath(Line, FileDir).then(function (Result) {
                    Opts.TargetFile = Result;
                    Content[LeIndex] = "";
                    LineResolve();
                  }, LineReject);
                } else if (CompilerLESS.RegexSourceMap.test(Line)) {
                  CompilerLESS.ExtractPath(Line, FileDir).then(function (Result) {
                    Content[LeIndex] = "";
                    if (Result === "") {
                      Opts.SourceMap = null;
                    } else {
                      Opts.SourceMap = Result;
                    }
                    LineResolve();
                  });
                } else if (CompilerLESS.RegexCompress.test(Line)) {
                  CompilerLESS.ExtractPath(Line, FileDir).then(function (Result) {
                    Content[LeIndex] = "";
                    Opts.Compress = Result === "true";
                    LineResolve();
                  });
                } else {
                  LineResolve();
                }
              }));
            }
          });
          Promise.all(Promises).then(function () {
            ToReturn.Content = Content.join("\n");
            resolve(ToReturn);
          }, reject);
        });
      },
      writable: true,
      configurable: true
    },
    Process: {
      value: function (FilePath, Opts) {
        return new Promise(function (resolve, reject) {
          FS.readFile(FilePath, function (Error, Content) {
            if (Error) {
              return reject(Error);
            }
            CompilerLESS.Parse(FilePath, Content.toString().split("\n"), Opts).then(function (Result) {
              Opts = Result.Opts;
              var HasSourceMap = Opts.SourceMap !== null,
                  ToReturn = {
                Content: "",
                SourceMap: "",
                Opts: Opts
              },
                  SourceMapURL = HasSourceMap ? H.Relative(Path.dirname(Opts.TargetFile), Opts.SourceMap) : null,
                  FileDir = Path.dirname(FilePath),
                  Temp = null;
              LESS = LESS || require("less");
              LESS.render(Result.Content, {
                sourceMap: true,
                filename: FilePath,
                paths: [FileDir],
                compress: Opts.Compress
              }).then(function (LeResult) {
                ToReturn.Content = LeResult.css;
                if (HasSourceMap) {
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
                resolve(ToReturn);
              }, reject);
            }, reject);
          });
        });
      },
      writable: true,
      configurable: true
    }
  });

  return CompilerLESS;
})();

module.exports = CompilerLESS;