

// @Compiler-Output "../Built/Compiler.js"
var
  Promise = require('a-promise'),
  FS = require('fs'),
  H = require('./H');
class Compiler{
  Map:Object;

  constructor(){
    var
      CompilerJS = new (require('./Plugins/Compiler-JS'))(this),
      CompilerCoffee = new(require('./Plugins/Compiler-Coffee'))(this),
      CompilerLESS = require('./Plugins/Compiler-LESS'),
      CompilerCSS = require('./Plugins/Compiler-CSS');
    CompilerLESS.init(this);
    CompilerCSS.init(this);
    this.Map = {
      'JS' : {Compiler: CompilerJS, Opts:{Compiler:'Babel', Shebang: null, Compress:false}},
      'JSX': {Compiler: CompilerJS, Opts:{Compiler:'Babel', Shebang: null, Compress:false}},
      'TAG': {Compiler: CompilerJS, Opts:{Compiler:'Riot', Shebang: null, Compress:false}},
      'COFFEE': {Compiler: CompilerCoffee, Opts:{Shebang: null, Compress: false}},
      'LESS': {Compiler: CompilerLESS, Opts:{Compress: false}},
      'CSS': {Compiler: CompilerCSS, Opts:{}}
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
          Opts = H.Clone(this.Map[Extension].Opts);
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
        },reject);

      }.bind(this));
    }.bind(this));
  }
  Watch(Directory:String, Opts:Object){
    console.log("I am a dummy La La La");
    console.log(Opts);
  }
}
module.exports = Compiler;
