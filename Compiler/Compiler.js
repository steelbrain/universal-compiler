

// @Compiler-Output "../Built/Compiler.js"
var
  Promise = require('a-promise'),
  FS = require('fs'),
  H = require('./H'),
  CompilerJS = new (require('./Plugins/Compiler-JS')),
  CompilerCoffee = new (require('./Plugins/Compiler-Coffee')),
  CompilerLESS = new (require('./Plugins/Compiler-LESS')),
  CompilerCSS = new (require('./Plugins/Compiler-CSS'));
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
    return new Promise(function(resolve,reject){
      H.FileExists(SourceFile).then(function(){
        var
          Extension = SourceFile.split('.').pop().toUpperCase(),
          Opts = null;
        if(!Compiler.Map.hasOwnProperty(Extension)){
          return reject('The given file type is not recognized');
        }
        Opts = H.Clone(Compiler.Map[Extension].Opts);
        Opts.TargetFile = TargetFile || null;
        Opts.SourceMap = SourceMap || null;
        Compiler.Map[Extension].Compiler.Process(SourceFile, Opts).then(function(Result){
          Opts = Result.Opts;
          if( !Opts.TargetFile ){
            return resolve(Result);
          }
          FS.writeFile(Opts.TargetFile,Result.Content,function(Error){
            if(Error){
              return reject(Error);
            }
            if( Opts.SourceMap ){
              FS.writeFile(Opts.SourceMap,Result.SourceMap, resolve);
            } else {
              resolve();
            }
          })
        },reject);
      },function(){
        return reject(`Source file ${SourceFile} doesn't exist`);
      });
    });
  }
}