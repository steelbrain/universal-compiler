

// @Compiler-Output "../../Built/Compiler/Plugins/Compiler-JS.js"
// @Compiler-Transpile "true"
module.exports = function(Compiler){
  var
    Promise = require('a-promise'),
    UglifyJS = null,
    Babel = null,
    Riot = null,
    ReactTools = null,
    H = require('../../Misc/H')(),
    Path = require('path'),
    CompilerBase = (require('../Abstract/Compiler-Base'))(Compiler);
  class CompilerJS extends CompilerBase{
    Map:Object = {
      Comments: ['/*','//'],
      Tags:[
        {
          Tags: ['Compiler-Name'],
          Callback:function(Info,Opts):void{
            Info[2] = Info[2].toUpperCase();
            if (Info[2] === 'BABEL') {
              Opts.Compiler = 'Babel';
            } else if (Info[2] === 'REACTTOOLS') {
              Opts.Compiler = 'ReactTools';
            } else if (Info[2] === 'RIOT') {
              Opts.Compiler = 'Riot';
            }
          }
        },
        {
          Tags: ['Compiler-Transpile'],
          Callback: function(Info,Opts):void{
            Opts.Transpile = Info[2] === 'true';
          }
        },
        {
          Tags: ['Compiler-Include'],
          Callback: function(Info,Opts,Content,Line,Index,FileDir):Promise{
            Opts.IncludedFiles.push(H.ABSPath(Info[2],FileDir));
            return new Promise(function(Resolve,Reject){
              Compiler.Compile(H.ABSPath(Info[2],FileDir), {Transpile:false}).then(function(Result){
                Resolve(Result.Content);
              },Reject);
            });
          }
        }
      ]
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
              HasSourceMap: Parsed.Opts.SourceMap !== null
            };
            global.uc_compiler_debug(`CompilerJS::Process Should Transpile ${ToReturn.Opts.Transpile}`);
            if(ToReturn.Opts.Transpile){
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
            }
            if(Opts.Compress){
              global.uc_compiler_debug("CompilerJS::Process Compress");
              this.ProcessUglify(FilePath, ToReturn, Parsed);
            }
            if(ToReturn.HasSourceMap){
              global.uc_compiler_debug("CompilerJS::Process SourceMap");
              ToReturn.Content += '//# sourceMappingURL=' + H.Relative(H.FileDir(Opts.TargetFile), Opts.SourceMap);
            } else {
              ToReturn.SourceMap = '';
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
  return CompilerJS;
};