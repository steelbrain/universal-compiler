

// @Compiler-Output "../Build/Compiler.js"
var
  Promise = require('a-promise'),
  FS = require('fs');
class Compiler{
  Map:Object;

  constructor(){
    var
      CompilerJS = require('./Plugins/Compiler-JS');
    this.Map = {
      'JS' : {Compiler: CompilerJS, Opts:{Compiler:'Babel'}},
      'JSX': {Compiler: CompilerJS, Opts:{Compiler:'Babel'}},
      'TAG': {Compiler: CompilerJS, Opts:{Compiler:'Riot'}}
    };
  }
  Compile(SourceFile:String, TargetFile:String, SourceMap:String):Promise{
    return new Promise(function(resolve,reject){
      FS.exists(SourceFile,function(Status){

        if(!Status){
          return reject(`Source file ${SourceFile} doesn't exist`);
        }

        var
          Extension = SourceFile.split('.').pop().toUpperCase(),
          Opts = this.Map[Extension].Opts;
        Opts.TargetFile = TargetFile || null;
        Opts.SourceMap = SourceMap || null;
        if(!this.Map.hasOwnProperty(Extension)){
          return reject(`The given file type is not recognized`);
        }
        this.Map[Extension].Compiler.Process(SourceFile, Opts).then(function(Result){
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
        }).catch(reject);

      }.bind(this));
    }.bind(this));
  }
}
module.exports = Compiler;
