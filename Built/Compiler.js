"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };



var Promise = require("a-promise"),
    FS = require("fs"),
    H = require("./H");
var Compiler = (function () {
  function Compiler() {
    _classCallCheck(this, Compiler);

    var CompilerJS = require("./Plugins/Compiler-JS"),
        CompilerCoffee = require("./Plugins/Compiler-Coffee"),
        CompilerLESS = require("./Plugins/Compiler-LESS"),
        CompilerCSS = require("./Plugins/Compiler-CSS");
    CompilerJS.init(this);
    CompilerCoffee.init(this);
    CompilerLESS.init(this);
    CompilerCSS.init(this);
    this.Map = {
      JS: { Compiler: CompilerJS, Opts: { Compiler: "Babel", Shebang: null, Compress: false } },
      JSX: { Compiler: CompilerJS, Opts: { Compiler: "Babel", Shebang: null, Compress: false } },
      TAG: { Compiler: CompilerJS, Opts: { Compiler: "Riot", Shebang: null, Compress: false } },
      COFFEE: { Compiler: CompilerCoffee, Opts: { Shebang: null, Compress: false } },
      LESS: { Compiler: CompilerLESS, Opts: { Compress: false } },
      CSS: { Compiler: CompilerCSS, Opts: {} }
    };
  }

  _prototypeProperties(Compiler, null, {
    Compile: {
      value: function (SourceFile, TargetFile, SourceMap) {
        return new Promise((function (resolve, reject) {
          FS.exists(SourceFile, (function (Status) {

            if (!Status) {
              return reject("Source file " + SourceFile + " doesn't exist");
            }

            var Extension = SourceFile.split(".").pop().toUpperCase(),
                Opts = H.Clone(this.Map[Extension].Opts);
            Opts.TargetFile = TargetFile || null;
            Opts.SourceMap = SourceMap || null;
            if (!this.Map.hasOwnProperty(Extension)) {
              return reject("The given file type is not recognized");
            }
            this.Map[Extension].Compiler.Process(SourceFile, Opts).then(function (Result) {
              Opts = Result.Opts;
              if (!Opts.TargetFile) {
                return resolve(Result);
              }
              FS.writeFile(Opts.TargetFile, Result.Content, function (Error) {
                if (Error) {
                  return reject(Error);
                }
                if (Opts.SourceMap) {
                  FS.writeFile(Opts.SourceMap, Result.SourceMap, resolve);
                } else {
                  resolve();
                }
              });
            }, reject);
          }).bind(this));
        }).bind(this));
      },
      writable: true,
      configurable: true
    },
    Watch: {
      value: function (Directory, Opts) {
        console.log("I am a dummy La La La");
        console.log(Opts);
      },
      writable: true,
      configurable: true
    }
  });

  return Compiler;
})();

module.exports = Compiler;