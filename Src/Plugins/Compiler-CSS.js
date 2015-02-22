

// @Compiler-Output "../../Built/Plugins/Compiler-JS.js"
var
  Promise = require('a-promise'),
  UglifyCSS = null,
  H = require('../H'),
  Path = require('path'),
  Compiler = null,
  CompilerBase = require('../Abstract/Compiler-Base').CompilerBase;
class CompilerCSS extends CompilerBase{
  Map:Object = {
    Comments: ['/*'],
    Tags:{
      'Compiler-Output':function(Info,Opts,Content,Line,Index,FileDir):void{
        Opts.TargetFile = H.ABSPath(Info[2],FileDir);
      },
      'Compiler-Compress':function(Info,Opts):void{
        Opts.Compress = Info[2] === 'true';
      },
      'Compiler-SourceMap': function(Info,Opts,Content,Line,Index,FileDir):void{
        Opts.SourceMap = H.ABSPath(Info[2],FileDir);
      },
      'Compiler-Append':function(Info,Opts,Content,Line,Index,FileDir):Promise{
        return new Promise(function(Resolve,Reject){
          Compiler.Compile(H.ABSPath(Info[2],FileDir)).then(function(Result){
            Resolve(Result.Content);
          },Reject);
        });
      }
    }
  };
  constructor(CompilerInst){
    Compiler = CompilerInst;
  }
  Process(FilePath:String, Opts:Object):Promise{
    return new Promise(function(Resolve,Reject){
      H.ReadFile(FilePath).then(function(Content){
        this.Parse(FilePath,Content,Opts).then(function(Parsed){
          var ToReturn = {Content: Parsed.Content, SourceMap: '', Opts: Parsed.Opts};
          if(Opts.Compress){
            this.ProcessUglify(FilePath, ToReturn, Parsed);
          }
          Resolve(ToReturn);
        }.bind(this),Reject);
      }.bind(this),Reject);
    }.bind(this));
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
module.exports = CompilerCSS;