"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };



var Promise = require("a-promise"),
    UglifyJS = null,
    Babel = null,
    Riot = null,
    ReactTools = null,
    FS = require("fs"),
    Path = require("path"),
    H = require("../H"),
    Compiler = null;
var CompilerJS = (function () {
  function CompilerJS() {
    _classCallCheck(this, CompilerJS);
  }

  CompilerJS.RegexAppend = /@(codekit-append|prepros-append|Compiler-Append)/;
  CompilerJS.RegexOutput = /@Compiler-Output/;
  CompilerJS.RegexCompiler = /@Compiler-Name/;
  CompilerJS.RegexSourceMap = /@Compiler-Sourcemap/;
  CompilerJS.RegexCompress = /@Compiler-Compress/;
  CompilerJS.RegexExtract = /".*"/;
  _prototypeProperties(CompilerJS, {
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
          var Result = CompilerJS.RegexExtract.exec(Line);
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
          CompilerJS.ExtractValue(Line).then(function (Result) {
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
          CompilerJS.ExtractPath(Line, FileDir).then(function (Result) {
            if (!HasSourceMap) {
              // Lets append it if we aren't giving em any source maps, EH!
              Compiler.Compile(Result).then(function (Result) {
                resolve("(function(){" + Result.Content + "}).call(this);");
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
    ParseCompiler: {
      value: function (Line) {
        return new Promise(function (resolve, reject) {
          CompilerJS.ExtractValue(Line).then(function (Result) {
            Result = Result.toUpperCase();
            if (Result === "BABEL") {
              resolve("Babel");
            } else if (Result === "REACTTOOLS") {
              resolve("ReactTools");
            } else if (Result === "RIOT") {
              resolve("Riot");
            } else if (Result === "") {
              resolve(null);
            } else {
              resolve();
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
            if (Line.indexOf("//") !== -1) {
              Promises.push(new Promise(function (LineResolve, LineReject) {
                Line = Line.trim();
                Index = Line.indexOf("//");
                if (Index === -1 || Index !== 0) {
                  return LineResolve(); // Ignore non-commented lines or lines with stuff + comments
                }
                if (CompilerJS.RegexAppend.test(Line)) {
                  CompilerJS.ParseAppend(Line, FileDir, FilePath, !!Opts.SourceMap).then(function (Result) {
                    Content[LeIndex] = Result;
                    LineResolve();
                  }, LineReject);
                } else if (CompilerJS.RegexOutput.test(Line)) {
                  CompilerJS.ExtractPath(Line, FileDir).then(function (Result) {
                    Opts.TargetFile = Result;
                    Content[LeIndex] = "";
                    LineResolve();
                  }, LineReject);
                } else if (CompilerJS.RegexCompiler.test(Line)) {
                  CompilerJS.ParseCompiler(Line).then(function (Compiler) {
                    Opts.Compiler = Compiler;
                    Content[LeIndex] = "";
                    LineResolve();
                  }, LineReject);
                } else if (CompilerJS.RegexSourceMap.test(Line)) {
                  CompilerJS.ExtractPath(Line, FileDir).then(function (Result) {
                    if (Result === "") {
                      Opts.SourceMap = null;
                    } else {
                      Opts.SourceMap = Result;
                    }
                    Content[LeIndex] = "";
                    LineResolve();
                  });
                } else if (CompilerJS.RegexCompress.test(Line)) {
                  CompilerJS.ExtractValue(Line).then(function (Result) {
                    Opts.Compress = Result === "true";
                    Content[LeIndex] = "";
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
            CompilerJS.Parse(FilePath, Content.toString().split("\n"), Opts).then(function (Result) {
              Opts = Result.Opts;
              var HasSourceMap = Opts.SourceMap !== null,
                  ToReturn = {
                Content: "",
                SourceMap: "",
                Opts: Opts
              },
                  Output = null;
              if (Opts.Compiler === "Babel") {
                Babel = Babel || require("babel");
                Output = Babel.transform(Result.Content, {
                  sourceMap: HasSourceMap,
                  sourceFileName: Path.basename(FilePath),
                  filenameRelative: Path.basename(Opts.TargetFile),
                  playground: true
                });
                ToReturn.Content = Output.code;
                ToReturn.SourceMap = JSON.stringify(Output.map);
              } else if (Opts.Compiler === "ReactTools") {
                ReactTools = ReactTools || require("react-tools");
                Output = ReactTools.transformWithDetails(Result.Content, {
                  harmony: true,
                  stripTypes: true,
                  sourceMap: HasSourceMap,
                  filename: Path.basename(Opts.TargetFile)
                });
                Output.sourceMap.sources = [Path.basename(FilePath)];
                ToReturn.Content = Output.code;
                ToReturn.SourceMap = JSON.stringify(Output.sourceMap);
              } else if (Opts.Compiler === "Riot") {
                Riot = Riot || require("riot");
                ToReturn.Content = Riot.compile(Result.Content, { compact: true });
              }
              if (Opts.Compress) {
                UglifyJS = UglifyJS || require("uglify-js");
                try {
                  Output = UglifyJS.minify(ToReturn.Content || Result.Content, { fromString: true, outSourceMap: HasSourceMap ? "js.map" : undefined });
                } catch (error) {
                  reject(error + "\nContent Was:\n" + ToReturn.Content);
                }
                ToReturn.Content = Output.code;
                if (HasSourceMap) {
                  ToReturn.SourceMap = Output.map;
                }
              }
              if (HasSourceMap) {
                ToReturn.Content += "//# sourceMappingURL=" + H.Relative(Path.dirname(Opts.TargetFile), Opts.SourceMap);
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

  return CompilerJS;
})();

module.exports = CompilerJS;