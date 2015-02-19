

class CompilerJS{
  Main:Compiler;
  constructor(Main:Compiler){
    this.Main = Main;
  }
  Compile(FilePath:String, Opts:Object):String{
    return "test";
  }
}
module.exports = CompilerJS;