"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

module.exports = function (Compiler) {
  var Promise = require("a-promise"),
      UglifyJS = null,
      CoffeeScript = null,
      H = require("../H"),
      Path = require("path"),
      CompilerBase = require("../Abstract/Compiler-Base")(Compiler);

  var CompilerCoffee = (function (CompilerBase) {
    function CompilerCoffee() {
      this.Map = {
        Comments: ["#"],
        Tags: []
      };

      _classCallCheck(this, CompilerCoffee);

      if (CompilerBase != null) {
        CompilerBase.apply(this, arguments);
      }
    }

    _inherits(CompilerCoffee, CompilerBase);

    _prototypeProperties(CompilerCoffee, null, {
      Process: {
        value: function Process(FilePath, Opts) {
          return new Promise((function (Resolve, Reject) {
            H.FileRead(FilePath).then((function (Content) {
              this.Parse(FilePath, Content, Opts).then((function (Parsed) {
                var ToReturn = { Content: Parsed.Content, SourceMap: "", Opts: Parsed.Opts };
                try {
                  this.ProcessCoffee(FilePath, ToReturn, Parsed);
                } catch (error) {
                  Reject(error);
                }
                if (Opts.Compress) {
                  this.ProcessUglify(FilePath, ToReturn, Parsed);
                }
                if (Opts.SourceMap !== null) {
                  ToReturn.Content += "//# sourceMappingURL=" + H.Relative(H.FileDir(Opts.TargetFile), Opts.SourceMap);
                }
                if (Opts.Shebang) {
                  ToReturn.Content = Opts.Shebang + "\n" + ToReturn.Content;
                }
                Resolve(ToReturn);
              }).bind(this), Reject);
            }).bind(this), Reject);
          }).bind(this));
        },
        writable: true,
        configurable: true
      },
      ProcessCoffee: {
        value: function ProcessCoffee(FilePath, ToReturn, _ref) {
          var Opts = _ref.Opts;
          var Content = _ref.Content;

          CoffeeScript = CoffeeScript || require("coffee-script");
          var Output = CoffeeScript.compile(Content, {
            sourceMap: true,
            sourceFiles: [Path.basename(FilePath)],
            generatedFile: Path.basename(Opts.TargetFile),
            inline: true
          });
          ToReturn.Content = Output.js;
          if (Opts.SourceMap !== null) {
            ToReturn.SourceMap = Output.v3SourceMap;
          }
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

    return CompilerCoffee;
  })(CompilerBase);

  return CompilerCoffee;
};