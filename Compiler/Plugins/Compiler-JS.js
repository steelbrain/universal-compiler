

// @Compiler-Output "../../Built/Plugins/Compiler-JS.js"
var
  Promise = require('a-promise'),
  UglifyJS = null,
  Babel = null,
  Riot = null,
  ReactTools = null,
  H = require('../H'),
  Path = require('path'),
  {Compiler} = require('../Compiler'),
  CompilerBase = require('../Abstract/Compiler-Base').CompilerBase;
class CompilerJS extends CompilerBase{
  Map:Object = {
    Comments: ['/*','//'],
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
      'Compiler-Name':function(Info,Opts):void{
        Info[2] = Info[2].toUpperCase();
        if (Info[2] === 'BABEL') {
          Opts.Compiler = 'Babel';
        } else if (Info[2] === 'REACTTOOLS') {
          Opts.Compiler = 'ReactTools';
        } else if (Info[2] === 'RIOT') {
          Opts.Compiler = 'Riot';
        }
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
      global.uc_compiler_debug("CompilerJS::Process Read");
      H.FileRead(FilePath).then(function(Content){
        global.uc_compiler_debug("CompilerJS::Process Parse");
        this.Parse(FilePath,Content,Opts).then(function(Parsed){
          var ToReturn = {
            Content: Parsed.Content,
            SourceMap: '',
            Opts: Parsed.Opts,
            HasSourceMap: Parsed.SourceMap !== null
          };
          try {
            global.uc_compiler_debug("CompilerJS::Process Compile");
            if(Parsed.Opts.Compiler === 'Babel'){
              global.uc_compiler_debug("CompilerJS::Process Compiler Babel");
              this.ProcessBabel(FilePath, ToReturn, Parsed);
            } else if(Parsed.Opts.Compiler === 'ReactTools'){
              global.uc_compiler_debug("CompilerJS::Process Compiler ReactTools");
              this.ProcessReact(FilePath, ToReturn, Parsed);
            } else if(Parsed.Opts.Compiler === 'Riot'){
              global.uc_compiler_debug("CompilerJS::Process Compiler Riot");
              this.ProcessRiot(FilePath, ToReturn, Parsed);
            }
          } catch(error){
            Reject(error);
          }
          if(Opts.Compress){
            global.uc_compiler_debug("CompilerJS::Process Compress");
            this.ProcessUglify(FilePath, ToReturn, Parsed);
          }
          if(ToReturn.HasSourceMap){
            global.uc_compiler_debug("CompilerJS::Process SourceMap");
            ToReturn.Content += '//# sourceMappingURL=' + H.Relative(H.FileDir(Opts.TargetFile), Opts.SourceMap);
          }
          if(Opts.Shebang){
            global.uc_compiler_debug("CompilerJS::Process Shebang");
            ToReturn.Content = Opts.Shebang + "\n" + ToReturn.Content;
          }
          global.uc_compiler_debug("CompilerJS::Process Resolving");
          Resolve(ToReturn);
        }.bind(this),Reject);
      }.bind(this),Reject);
    }.bind(this));
  }
  ProcessBabel(FilePath, ToReturn, {Opts,Content}){
    Babel = Babel || require('babel');
    var Output = Babel.transform(Content,{
      sourceMap: Opts.SourceMap !== null,
      sourceFileName: Path.basename(FilePath),
      filenameRelative: Path.basename(Opts.TargetFile),
      playground: true
    });
    ToReturn.Content = Output.code;
    ToReturn.SourceMap = JSON.stringify(Output.map);
  }
  ProcessReact(FilePath, ToReturn, {Opts,Content}){
    ReactTools = ReactTools || require('react-tools');
    var Output = ReactTools.transformWithDetails(Content,{
      harmony:true,
      stripTypes:true,
      sourceMap: Opts.SourceMap !== null,
      filename: Path.basename(Opts.TargetFile)
    });
    if(ToReturn.HasSourceMap){
      Output.sourceMap.sources = [Path.basename(FilePath)];
      ToReturn.SourceMap = JSON.stringify(Output.sourceMap);
    }
    ToReturn.Content = Output.code;
  }
  ProcessRiot(FilePath, ToReturn, {Opts,Content}){
    Riot = Riot || require('riot');
    ToReturn.Content = Riot.compile(Content,{compact:true});
  }
  ProcessUglify(FilePath, ToReturn, {Opts,Content}){
    UglifyJS = UglifyJS || require('uglify-js');
    ToReturn.Content = UglifyJS.minify(ToReturn.Content,{fromString: true}).code;
    ToReturn.SourceMap = '';
  }
}
module.exports = CompilerJS;