"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

module.exports = function (Compiler) {
  var Promise = require("a-promise"),
      UglifyJS = null,
      Babel = null,
      Riot = null,
      ReactTools = null,
      H = require("../../Misc/H")(),
      Path = require("path"),
      CompilerBase = require("../Abstract/Compiler-Base")(Compiler);

  var CompilerJS = (function (CompilerBase) {
    function CompilerJS() {
      this.Map = {
        Comments: ["/*", "//"],
        Tags: [{
          Tags: ["Compiler-Name"],
          Callback: function Callback(Info, Opts) {
            Info[2] = Info[2].toUpperCase();
            if (Info[2] === "BABEL") {
              Opts.Compiler = "Babel";
            } else if (Info[2] === "REACTTOOLS") {
              Opts.Compiler = "ReactTools";
            } else if (Info[2] === "RIOT") {
              Opts.Compiler = "Riot";
            }
          }
        }]
      };

      _classCallCheck(this, CompilerJS);

      if (CompilerBase != null) {
        CompilerBase.apply(this, arguments);
      }
    }

    _inherits(CompilerJS, CompilerBase);

    _prototypeProperties(CompilerJS, null, {
      Process: {
        value: function Process(FilePath, Opts) {
          return new Promise((function (Resolve, Reject) {
            global.uc_compiler_debug("CompilerJS::Process Read");
            H.FileRead(FilePath).then((function (Content) {
              global.uc_compiler_debug("CompilerJS::Process Parse");
              this.Parse(FilePath, Content, Opts).then((function (Parsed) {
                var ToReturn = {
                  Content: Parsed.Content,
                  SourceMap: "",
                  Opts: Parsed.Opts,
                  HasSourceMap: Parsed.Opts.SourceMap !== null
                };
                try {
                  global.uc_compiler_debug("CompilerJS::Process Compile");
                  if (Parsed.Opts.Compiler === "Babel") {
                    global.uc_compiler_debug("CompilerJS::Process Compiler Babel");
                    this.ProcessBabel(FilePath, ToReturn, Parsed);
                  } else if (Parsed.Opts.Compiler === "ReactTools") {
                    global.uc_compiler_debug("CompilerJS::Process Compiler ReactTools");
                    this.ProcessReact(FilePath, ToReturn, Parsed);
                  } else if (Parsed.Opts.Compiler === "Riot") {
                    global.uc_compiler_debug("CompilerJS::Process Compiler Riot");
                    this.ProcessRiot(FilePath, ToReturn, Parsed);
                  }
                } catch (error) {
                  Reject(error);
                }
                if (Opts.Compress) {
                  global.uc_compiler_debug("CompilerJS::Process Compress");
                  this.ProcessUglify(FilePath, ToReturn, Parsed);
                }
                if (ToReturn.HasSourceMap) {
                  global.uc_compiler_debug("CompilerJS::Process SourceMap");
                  ToReturn.Content += "//# sourceMappingURL=" + H.Relative(H.FileDir(Opts.TargetFile), Opts.SourceMap);
                } else {
                  ToReturn.SourceMap = "";
                }
                if (Opts.Shebang) {
                  global.uc_compiler_debug("CompilerJS::Process Shebang");
                  ToReturn.Content = Opts.Shebang + "\n" + ToReturn.Content;
                }
                global.uc_compiler_debug("CompilerJS::Process Resolving");
                Resolve(ToReturn);
              }).bind(this), Reject);
            }).bind(this), Reject);
          }).bind(this));
        },
        writable: true,
        configurable: true
      },
      ProcessBabel: {
        value: function ProcessBabel(FilePath, ToReturn, _ref) {
          var Opts = _ref.Opts;
          var Content = _ref.Content;

          Babel = Babel || require("babel");
          var Output = Babel.transform(Content, {
            sourceMap: Opts.SourceMap !== null,
            sourceFileName: Path.basename(FilePath),
            filenameRelative: Path.basename(Opts.TargetFile),
            playground: true
          });
          ToReturn.Content = Output.code;
          ToReturn.SourceMap = JSON.stringify(Output.map);
        },
        writable: true,
        configurable: true
      },
      ProcessReact: {
        value: function ProcessReact(FilePath, ToReturn, _ref) {
          var Opts = _ref.Opts;
          var Content = _ref.Content;

          ReactTools = ReactTools || require("react-tools");
          var Output = ReactTools.transformWithDetails(Content, {
            harmony: true,
            stripTypes: true,
            sourceMap: Opts.SourceMap !== null,
            filename: Path.basename(Opts.TargetFile)
          });
          if (ToReturn.HasSourceMap) {
            Output.sourceMap.sources = [Path.basename(FilePath)];
            ToReturn.SourceMap = JSON.stringify(Output.sourceMap);
          }
          ToReturn.Content = Output.code;
        },
        writable: true,
        configurable: true
      },
      ProcessRiot: {
        value: function ProcessRiot(FilePath, ToReturn, _ref) {
          var Opts = _ref.Opts;
          var Content = _ref.Content;

          Riot = Riot || require("riot");
          ToReturn.Content = Riot.compile(Content, { compact: true });
        },
        writable: true,
        configurable: true
      },
      ProcessUglify: {
        value: function ProcessUglify(FilePath, ToReturn, _ref) {
          var Opts = _ref.Opts;
          var Content = _ref.Content;

          UglifyJS = UglifyJS || require("uglify-js");
          ToReturn.Content = UglifyJS.minify(ToReturn.Content, { fromString: true }).code;
          ToReturn.SourceMap = "";
        },
        writable: true,
        configurable: true
      }
    });

    return CompilerJS;
  })(CompilerBase);

  return CompilerJS;
};