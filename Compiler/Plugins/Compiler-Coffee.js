

// @Compiler-Output "../../Built/Compiler/Plugins/Compiler-Coffee.js"
module.exports = function(Compiler){
  var
    Promise = require('a-promise'),
    UglifyJS = null,
    CoffeeScript = null,
    H = require('../H'),
    Path = require('path'),
    CompilerBase = require('../Abstract/Compiler-Base').CompilerBase;
  class CompilerCoffee extends CompilerBase{
    Map:Object = {
      Comments: ['#'],
      Tags:{
        'Compiler-Output':function(Info,Opts,Content,Line,Index,FileDir):void{
          Opts.TargetFile = H.ABSPath(Info[2],FileDir);
        },
        'Compiler-SourceMap': function(Info,Opts,Content,Line,Index,FileDir):void{
          Opts.SourceMap = H.ABSPath(Info[2],FileDir);
        },
        'Compiler-Compress':function(Info,Opts):void{
          Opts.Compress = Info[2] === 'true';
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
    Process(FilePath:String, Opts:Object):Promise{
      return new Promise(function(Resolve,Reject){
        H.FileRead(FilePath).then(function(Content){
          this.Parse(FilePath,Content,Opts).then(function(Parsed){
            var ToReturn = {Content: Parsed.Content, SourceMap: '', Opts: Parsed.Opts};
            try {
              this.ProcessCoffee(FilePath, ToReturn,Parsed);
            } catch(error){
              Reject(error);
            }
            if(Opts.Compress){
              this.ProcessUglify(FilePath, ToReturn, Parsed);
            }
            if(Opts.SourceMap !== null){
              ToReturn.Content += '//# sourceMappingURL=' + H.Relative(H.FileDir(Opts.TargetFile), Opts.SourceMap);
            }
            if(Opts.Shebang){
              ToReturn.Content = Opts.Shebang + "\n" + ToReturn.Content;
            }
            Resolve(ToReturn);
          }.bind(this),Reject);
        }.bind(this),Reject);
      }.bind(this));
    }
    ProcessCoffee(FilePath, ToReturn, {Opts,Content}){
      CoffeeScript = CoffeeScript || require('coffee-script');
      var Output = CoffeeScript.compile(Content,{
        sourceMap: true,
        sourceFiles: [Path.basename(FilePath)],
        generatedFile: Path.basename(Opts.TargetFile),
        inline: true
      });
      ToReturn.Content = Output.js;
      if(Opts.SourceMap !== null){
        ToReturn.SourceMap = Output.v3SourceMap;
      }
    }
    ProcessUglify(FilePath, ToReturn, {Opts,Content}){
      UglifyJS = UglifyJS || require('uglify-js');
      ToReturn.Content = UglifyJS.minify(ToReturn.Content,{fromString: true}).code;
      ToReturn.SourceMap = '';
    }
  }
  return CompilerCoffee;
};