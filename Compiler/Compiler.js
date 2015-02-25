

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
  static Compile(SourceFile:String, TargetFile:String, SourceMap:String):Promise{
    global.uc_compiler_debug("Compiler::Compile "+SourceFile);
    return new Promise(function(resolve,reject){
      H.FileExists(SourceFile).then(function(){
        global.uc_compiler_debug("Compiler::Compile Exists");
        var
          Extension = SourceFile.split('.').pop().toUpperCase(),
          Opts = null;
        if(!Compiler.Map.hasOwnProperty(Extension)){
          global.uc_compiler_debug("Compiler::Compile Unrecognized");
          return reject('The given file type is not recognized');
        }
        Opts = H.Clone(Compiler.Map[Extension].Opts);
        Opts.TargetFile = TargetFile || null;
        Opts.SourceMap = SourceMap || null;
        global.uc_compiler_debug("Compiler::Compile Pre-Process");
        Compiler.Map[Extension].Compiler.Process(SourceFile, Opts).then(function(Result){
          global.uc_compiler_debug("Compiler::Compile Continuing");
          Opts = Result.Opts;
          if( !Opts.TargetFile ){
            global.uc_compiler_debug("Compiler::Compile Return Processed");
            return resolve(Result);
          }
          global.uc_compiler_debug("Compiler::Compile Write Processed");
          global.uc_compiler_debug("Compiler::Compile Target " + Opts.TargetFile);
          FS.writeFile(Opts.TargetFile,Result.Content,function(Error){
            if(Error){
              return reject(Error);
            }
            if( Opts.SourceMap ){
              global.uc_compiler_debug("Compiler::Compile Write SourceMap");
              global.uc_compiler_debug("Compiler::Compile SourceMap " + Opts.SourceMap);
              FS.writeFile(Opts.SourceMap,Result.SourceMap, resolve);
            } else {
              resolve();
            }
          })
        },reject);
      },function(){
        global.uc_compiler_debug("Compiler::Compile doesn't exist");
        return reject(`Source file ${SourceFile} doesn't exist`);
      });
    });
  }
}
Compiler.Init();
module.exports = {Compiler};