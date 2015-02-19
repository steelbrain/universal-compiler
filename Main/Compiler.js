
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
  Compile(SourceFile:String, TargetFile:String, SourceMap:String):String{
    if(!this.FS.existsSync(SourceFile)){
      throw new Error(`Source file ${SourceFile} doesn't exist`);
    }
    var
      SourceDir = this.Path.dirname(SourceFile),
      Extension = SourceFile.split('.').pop().toUpperCase();
    if(!this.Map.hasOwnProperty(Extension)){
      throw new Error("The given file type is not recognized");
    }
    var Result = this.Map[Extension].Compiler.Compile(SourceFile, this.Map[Extension].Opts);
    console.log(Result);
  }
}
module.exports = Compiler;