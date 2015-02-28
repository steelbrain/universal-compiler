

// @Compiler-Output "../Built/Compiler/Compiler.js"
var
  Promise = require('a-promise'),
  FS = require('fs'),
  H = require('./H'),
  CompilerJS = require('./Plugins/Compiler-JS'),
  CompilerCoffee = require('./Plugins/Compiler-Coffee'),
  CompilerLESS = require('./Plugins/Compiler-LESS'),
  CompilerCSS = require('./Plugins/Compiler-CSS');
global.uc_compiler_debug = require('debug')('uc-compiler');
class Compiler{
  static Init():void{
    CompilerJS = new (CompilerJS(Compiler));
    CompilerCoffee = new (CompilerCoffee(Compiler));
    CompilerLESS = new (CompilerLESS(Compiler));
    CompilerCSS = new (CompilerCSS(Compiler));
    Compiler.Map = {
      'JS' : {Compiler: CompilerJS, Opts:{Compiler:'Babel', Shebang: null, Compress:false}},
      'JSX': {Compiler: CompilerJS, Opts:{Compiler:'Babel', Shebang: null, Compress:false}},
      'TAG': {Compiler: CompilerJS, Opts:{Compiler:'Riot', Shebang: null, Compress:false}},
      'COFFEE': {Compiler: CompilerCoffee, Opts:{Shebang: null, Compress: false}},
      'LESS': {Compiler: CompilerLESS, Opts:{Compress: false}},
      'CSS': {Compiler: CompilerCSS, Opts:{Compress: false}}
    };
  }
  static Map:Object = {};
  static Compile(SourceFile:String, Opts:Object):Promise{
    global.uc_compiler_debug("Compiler::Compile "+SourceFile);
    return new Promise(function(Resolve,Reject){
      H.FileExists(SourceFile).then(function(){
        global.uc_compiler_debug("Compiler::Compile Exists");
        var
          Extension = SourceFile.split('.').pop().toUpperCase(),
          CompileOpts = H.Merge({TargetFile: null, SourceMap: null, Write:false}, Compiler.Map[Extension].Opts, Opts);
        if(!Compiler.Map.hasOwnProperty(Extension)){
          global.uc_compiler_debug("Compiler::Compile Unrecognized");
          return Reject('The given file type is not recognized');
        }
        CompileOpts.IncludedFiles = [];
        global.uc_compiler_debug("Compiler::Compile Pre-Process");
        Compiler.Map[Extension].Compiler.Process(SourceFile, CompileOpts).then(function(Result){
          global.uc_compiler_debug("Compiler::Compile Continuing");
          CompileOpts = Result.Opts;
          if(!CompileOpts.Write || !CompileOpts.TargetFile){
            global.uc_compiler_debug("Compiler::Compile Return Processed");
            return Resolve(Result);
          }
          global.uc_compiler_debug("Compiler::Compile Write Processed");
          global.uc_compiler_debug("Compiler::Compile Target " + CompileOpts.TargetFile);
          FS.writeFile(CompileOpts.TargetFile,Result.Content,function(Error){
            if(Error){
              return Reject(Error);
            }
            if( CompileOpts.SourceMap ){
              global.uc_compiler_debug("Compiler::Compile Write SourceMap");
              global.uc_compiler_debug("Compiler::Compile SourceMap " + CompileOpts.SourceMap);
              FS.writeFile(CompileOpts.SourceMap,Result.SourceMap, function(){
                Resolve(Result);
              });
            } else {
              Resolve(Result);
            }
          })
        },Reject);
      },function(){
        global.uc_compiler_debug("Compiler::Compile doesn't exist");
        return Reject(`Source file ${SourceFile} doesn't exist`);
      });
    });
  }
}
Compiler.Init();
module.exports = {Compiler};