"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };



var Promise = require("a-promise"),
    UglifyJS = null,
    CoffeeScript = null,
    FS = require("fs"),
    Path = require("path"),
    H = require("../H"),
    Compiler = null;
var CompilerCoffee = (function () {
  function CompilerCoffee() {
    _classCallCheck(this, CompilerCoffee);
  }

  CompilerCoffee.RegexAppend = /@(codekit-append|prepros-append|Compiler-Append)/;
  CompilerCoffee.RegexOutput = /@Compiler-Output/;
  CompilerCoffee.RegexSourceMap = /@Compiler-Sourcemap/;
  CompilerCoffee.RegexCompress = /@Compiler-Compress/;
  CompilerCoffee.RegexExtract = /".*"/;
  _prototypeProperties(CompilerCoffee, {
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
          var Result = CompilerCoffee.RegexExtract.exec(Line);
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
          CompilerCoffee.ExtractValue(Line).then(function (Result) {
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
          CompilerCoffee.ExtractPath(Line, FileDir).then(function (Result) {
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
          if (Content.length) {
            if (Content[0].substr(0, 2) === "#!") {
              // Shebang
              Opts.Shebang = Content[0];
              Content[0] = "";
            }
          }
          Content.forEach(function (Line, LeIndex) {
            var Index;
            if (Line.indexOf("#") !== -1) {
              Promises.push(new Promise(function (LineResolve, LineReject) {
                Line = Line.trim();
                Index = Line.indexOf("#");
                if (Index === -1 || Index !== 0) {
                  return LineResolve(); // Ignore non-commented lines or lines with stuff + comments
                }
                if (CompilerCoffee.RegexAppend.test(Line)) {
                  CompilerCoffee.ParseAppend(Line, FileDir, FilePath, !!Opts.SourceMap).then(function (Result) {
                    Content[LeIndex] = Result;
                    LineResolve();
                  }, LineReject);
                } else if (CompilerCoffee.RegexOutput.test(Line)) {
                  CompilerCoffee.ExtractPath(Line, FileDir).then(function (Result) {
                    Opts.TargetFile = Result;
                    Content[LeIndex] = "";
                    LineResolve();
                  }, LineReject);
                } else if (CompilerCoffee.RegexSourceMap.test(Line)) {
                  CompilerCoffee.ExtractPath(Line, FileDir).then(function (Result) {
                    Content[LeIndex] = "";
                    if (Result === "") {
                      Opts.SourceMap = null;
                    } else {
                      Opts.SourceMap = Result;
                    }
                    LineResolve();
                  });
                } else if (CompilerCoffee.RegexCompress.test(Line)) {
                  CompilerCoffee.ExtractValue(Line).then(function (Result) {
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
            CompilerCoffee.Parse(FilePath, Content.toString().split("\n"), Opts).then(function (Result) {
              Opts = Result.Opts;
              var HasSourceMap = Opts.SourceMap !== null,
                  ToReturn = {
                Content: "",
                SourceMap: "",
                Opts: Opts
              },
                  Output = null,
                  PathName = null;
              CoffeeScript = CoffeeScript || require("coffee-script");
              try {
                Output = CoffeeScript.compile(Result.Content, {
                  sourceMap: true,
                  sourceFiles: [Path.basename(FilePath)],
                  generatedFile: Path.basename(Opts.TargetFile),
                  inline: true
                });
              } catch (error) {
                reject(error);
              }
              ToReturn.Content = Output.js;
              if (HasSourceMap) {
                ToReturn.SourceMap = Output.v3SourceMap;
                ToReturn.Content += "//# sourceMappingURL=" + H.Relative(Path.dirname(Opts.TargetFile), Opts.SourceMap);
              }
              if (Opts.Compress) {
                UglifyJS = UglifyJS || require("uglify-js");
                Output = UglifyJS.minify(ToReturn.Content, { fromString: true });
                ToReturn.Content = Output.code;
                ToReturn.Sourcemap = "";
              }
              if (Opts.Shebang) {
                ToReturn.Content = Opts.Shebang + "\n" + ToReturn.Content;
              }
              resolve(ToReturn);
            }, reject);
          });
        });
      },
      writable: true,
      configurable: true
    }
  });

  return CompilerCoffee;
})();

module.exports = CompilerCoffee;