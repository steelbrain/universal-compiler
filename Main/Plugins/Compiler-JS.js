

class CompilerJS{
  Main:Compiler;
  constructor(Main:Compiler){
    this.Main = Main;
  }
  Compile(FilePath:String, Opts:Object):Promise{
    var ToReturn = {SourceMap: "", Result: ""};
    return new Promise(function(resolve){
      resolve(ToReturn);
    });
  }
}
module.exports = CompilerJS;