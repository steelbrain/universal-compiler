

var
  FS = require('fs'),
  Path = require('path'),
  CompilerJS = require('./Plugins/Compiler-JS');
class Compiler{
  ModulesPath:String = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']+'/node_modules/';
  Map:Object = {
    'JS' : {Compiler: CompilerJS, Opts:{}},
    'JSX': {Compiler: CompilerJS, Opts:{}}
  };

  constructor(){

  }
  Compile(SourceFile:String, TargetFile:String, SourceMap:String):String{
    if(!FS.existsSync(SourceFile)){
      throw new Error(`Source file ${SourceFile} doesn't exist`);
    }
    var
      SourceDir = Path.dirname(SourceFile),
      Extension = SourceFile.split('.').pop().toUpperCase();
    if(!this.Map.hasOwnProperty(Extension)){
      throw new Error("The given file type is not recognized");
    }
    var Result = this.Map[Extension].Compiler.Compile(SourceFile, this.Map[Extension].Opts);
    console.log(Result);
  }
}
module.exports = Compiler;