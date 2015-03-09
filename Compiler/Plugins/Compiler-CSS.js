

// @Compiler-Output "../../Built/Compiler/Plugins/Compiler-CSS.js"
module.exports = function(Compiler){
  var
    Promise = require('a-promise'),
    UglifyCSS = null,
    H = require('../../Misc/H')(),
    Path = require('path'),
    CompilerBase = (require('../Abstract/Compiler-Base'))(Compiler);
  class CompilerCSS extends CompilerBase{
    Map:Object = {
      Comments: ['/*'],
      Tags:[]
    };
    Process(FilePath:String, Opts:Object):Promise{
      var Me = this;
      return new Promise(function(Resolve,Reject){
        H.FileRead(FilePath).then(function(Content){
          Me.Parse(FilePath,Content,Opts).then(function(Parsed){
            var ToReturn = {Content: Parsed.Content, SourceMap: '', Opts: Parsed.Opts};
            if(Opts.Compress){
              Me.ProcessUglify(FilePath, ToReturn, Parsed);
            }
            Resolve(ToReturn);
          },Reject);
        },Reject);
      });
    }
    ProcessUglify(FilePath, ToReturn, {Opts,Content}){
      UglifyCSS = UglifyCSS || new(require('clean-css'))({sourceMap:true});
      var Output = UglifyCSS.minify(Content);
      ToReturn.Content = Output.styles;
      if(Opts.SourceMap !== null){
        ToReturn.SourceMap = JSON.parse(Output.sourceMap);
        ToReturn.SourceMap.sources = [Path.basename(FilePath)];
        ToReturn.SourceMap = JSON.stringify(ToReturn.SourceMap);
        ToReturn.Content += '/*# sourceMappingURL='+H.Relative(Path.dirname(Opts.TargetFile), Opts.SourceMap)+' */';
      }
    }
  }
  return CompilerCSS;
};