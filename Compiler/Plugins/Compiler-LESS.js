

// @Compiler-Output "../../Built/Compiler/Plugins/Compiler-LESS.js"
module.exports = function(Compiler){
  var
    Promise = require('a-promise'),
    UglifyCSS = null,
    LESS = null,
    H = require('../H'),
    Path = require('path'),
    CompilerBase = require('../Abstract/Compiler-Base').CompilerBase;
  class CompilerLESS extends CompilerBase{
    Map:Object = {
      Comments: ['//','/*'],
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
    Process(FilePath:String, Opts:Object):Promise{
      return new Promise(function(Resolve,Reject){
        H.FileRead(FilePath).then(function(Content){
          this.Parse(FilePath,Content,Opts).then(function(Parsed){
            var ToReturn = {Content: Parsed.Content, SourceMap: '', Opts: Parsed.Opts};
            this.ProcessLESS(FilePath, ToReturn, Parsed).then(function(){
              if(Opts.Compress){
                this.ProcessUglify(FilePath, ToReturn, Parsed);
              }
              Resolve(ToReturn);
            }.bind(this));
          }.bind(this),Reject);
        }.bind(this),Reject);
      }.bind(this));
    }
    ProcessLESS(FilePath, ToReturn, {Opts,Content}):Promise{
      return new Promise(function(Resolve,Reject){
        var
          Temp = null,
          SourceMapURL = Opts.SourceMap !== null ? H.Relative(H.FileDir(Opts.TargetFile), Opts.SourceMap) : null,
          FileDir = Path.dirname(FilePath);
        LESS = LESS || require('less');
        LESS.render(Content,{
          sourceMap: true,
          filename: FilePath,
          paths: [FileDir],
          compress: Opts.Compress
        }).then(function(LeResult){
          ToReturn.Content = LeResult.css;
          if(Opts.SourceMap !== null){
            Temp = {Map: JSON.parse(LeResult.map),Files:[], SourceMapDir: Opts.SourceMap.split(Path.sep)};
            Temp.SourceMapDir.pop();
            Temp.SourceMapDir = Temp.SourceMapDir.join(Path.sep);
            Temp.Map.sources.forEach(function(File){
              Temp.Files.push(H.Relative(Temp.SourceMapDir,File));
            });
            Temp.Map.sources = Temp.Files;
            ToReturn.SourceMap = JSON.stringify(Temp.Map);
            ToReturn.Content += '/*# sourceMappingURL=' + SourceMapURL + ' */';
          }
          Resolve();
        },Reject);
      });
    }
    ProcessUglify(FilePath, ToReturn, {Opts,Content}){
      UglifyCSS = UglifyCSS || new(require('clean-css'))({sourceMap:true});
      var Output = UglifyCSS.minify(Content);
      ToReturn.Content = Output.styles;
      ToReturn.SourceMap = '';
    }
  }
  return CompilerLESS;
};