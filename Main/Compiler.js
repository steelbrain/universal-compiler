
class Compiler{
  FS = require('fs');
  Path = require('path');
  ModulesPath:String = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']+'/node_modules/';
  Map:Object;

  constructor(){
    var
      CompilerJS = new (require('./Plugins/Compiler-JS'))(this);
    this.Map = {
      'JS' : {Compiler: CompilerJS, Opts:{}},
      'JSX': {Compiler: CompilerJS, Opts:{}}
    };
  }
  Compile(SourceFile:String, TargetFile:String, SourceMap:String):Promise{
    return new Promise(function(resolve,reject){
      this.FS.exists(SourceFile,function(Status){
        if(!Status){
          return reject(`Source file ${SourceFile} doesn't exist`);
        }

        var
          SourceDir = this.Path.dirname(SourceFile),
          Extension = SourceFile.split('.').pop().toUpperCase();
        if(!this.Map.hasOwnProperty(Extension)){
          return reject(`The given file type is not recognized`);
        }
        this.Map[Extension].Compiler.Compile(SourceFile, this.Map[Extension].Opts).then(function(Result){
          console.log(Result);
        });
      }.bind(this));
    }.bind(this));
  }
}
module.exports = Compiler;
