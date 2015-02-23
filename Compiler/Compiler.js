

// @Compiler-Output "../Built/Compiler/Compiler.js"
var
  Promise = require('a-promise'),
  FS = require('fs'),
  H = require('./H'),
  CompilerJS = new (require('./Plugins/Compiler-JS')),
  CompilerCoffee = new (require('./Plugins/Compiler-Coffee')),
  CompilerLESS = new (require('./Plugins/Compiler-LESS')),
  CompilerCSS = new (require('./Plugins/Compiler-CSS'));
global.uc_compiler_debug = require('debug')('uc-compiler');
export class Compiler{
  static Map:Object = {
    'JS' : {Compiler: CompilerJS, Opts:{Compiler:'Babel', Shebang: null, Compress:false}},
    'JSX': {Compiler: CompilerJS, Opts:{Compiler:'Babel', Shebang: null, Compress:false}},
    'TAG': {Compiler: CompilerJS, Opts:{Compiler:'Riot', Shebang: null, Compress:false}},
    'COFFEE': {Compiler: CompilerCoffee, Opts:{Shebang: null, Compress: false}},
    'LESS': {Compiler: CompilerLESS, Opts:{Compress: false}},
    'CSS': {Compiler: CompilerCSS, Opts:{Compress: false}}
  };
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
        Opts = Object.clone(Compiler.Map[Extension].Opts);
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