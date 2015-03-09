"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

module.exports = function (Compiler) {
  var Promise = require("a-promise"),
      UglifyCSS = null,
      H = require("../../Misc/H")(),
      Path = require("path"),
      CompilerBase = require("../Abstract/Compiler-Base")(Compiler);

  var CompilerCSS = (function (CompilerBase) {
    function CompilerCSS() {
      this.Map = {
        Comments: ["/*"],
        Tags: []
      };

      _classCallCheck(this, CompilerCSS);

      if (CompilerBase != null) {
        CompilerBase.apply(this, arguments);
      }
    }

    _inherits(CompilerCSS, CompilerBase);

    _prototypeProperties(CompilerCSS, null, {
      Process: {
        value: function Process(FilePath, Opts) {
          var Me = this;
          return new Promise(function (Resolve, Reject) {
            H.FileRead(FilePath).then(function (Content) {
              Me.Parse(FilePath, Content, Opts).then(function (Parsed) {
                var ToReturn = { Content: Parsed.Content, SourceMap: "", Opts: Parsed.Opts };
                if (Opts.Compress) {
                  Me.ProcessUglify(FilePath, ToReturn, Parsed);
                }
                Resolve(ToReturn);
              }, Reject);
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
          if (Opts.SourceMap !== null) {
            ToReturn.SourceMap = JSON.parse(Output.sourceMap);
            ToReturn.SourceMap.sources = [Path.basename(FilePath)];
            ToReturn.SourceMap = JSON.stringify(ToReturn.SourceMap);
            ToReturn.Content += "/*# sourceMappingURL=" + H.Relative(Path.dirname(Opts.TargetFile), Opts.SourceMap) + " */";
          }
        },
        writable: true,
        configurable: true
      }
    });

    return CompilerCSS;
  })(CompilerBase);

  return CompilerCSS;
};