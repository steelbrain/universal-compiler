

// @Compiler-Output "../../Build/Plugins/Compiler-Coffee.js"
var
  Promise = require('a-promise'),
  UglifyJS = null,
  CoffeeScript = null,
  FS = require('fs'),
  Path = require('path'),
  H = require('../H'),
  Compiler = null;
class CompilerCoffee{
  static RegexAppend:RegExp = /@(codekit-append|prepros-append|Compiler-Append)/;
  static RegexOutput:RegExp = /@Compiler-Output/;
  static RegexSourceMap:RegExp = /@Compiler-Sourcemap/;
  static RegexExtract:RegExp = /".*"/;
  static init(LeCompiler):void{
    Compiler = LeCompiler;
  }

  static ExtractValue(Line:String):Promise{
    return new Promise(function(resolve,reject){
      var Result = CompilerCoffee.RegexExtract.exec(Line);
      if (!Result.length) {
        return reject(); // Skip empty "@codekit-append"
      }
      Result = Result[0].substr(1, Result[0].length - 2);
      resolve(Result);
    });
  }
  static ExtractPath(Line:String, FileDir:String):Promise{
    return new Promise(function(resolve,reject){
      CompilerCoffee.ExtractValue(Line).then(function(Result:String){
        if (Result.substr(0, 1) !== Path.sep &&
          Result.substr(1, 1) !== ':') { // Windows Drive `D:\`
          Result = FileDir + Path.sep + Result;
        }
        resolve(Result);
      },reject);
    });
  }

  static ParseAppend(Line:String, FileDir: String, FilePath:String, HasSourceMap:Boolean):Promise{
    return new Promise(function(resolve,reject){
      CompilerCoffee.ExtractPath(Line, FileDir).then(function(Result){
        if(!HasSourceMap){
          // Lets append it if we aren't giving em any source maps, EH!
          Compiler.Compile(Result).then(function(Result){
            resolve(Result.Content);
          },reject)
        } else {
          FS.readFile(Result, function (Error, LeContent) {
            if (Error) {
              return reject(`The File '${Result} doesn't exist, It was imported in ${FilePath}'`);
            }
            resolve(LeContent.toString());
          });
        }
      },reject);
    });
  }
  static Parse(FilePath:String, Content:Array, Opts:Object):Promise{
    return new Promise(function(resolve,reject){
      var
        ToReturn = {Content: "", Opts: Opts},
        FileDir = Path.dirname(FilePath),
        Promises = [];
      Content.forEach(function(Line:String, LeIndex:Number){
        var Index;
        if(Line.indexOf('#') !== -1){
          Promises.push(new Promise(function(LineResolve,LineReject){
            Line = Line.trim();
            Index = Line.indexOf('#');
            if(Index === -1 || Index !== 0){
              return LineResolve(); // Ignore non-commented lines or lines with stuff + comments
            }
            if(CompilerCoffee.RegexAppend.test(Line)) {
              CompilerCoffee.ParseAppend(Line, FileDir,FilePath, !!Opts.SourceMap).then(function(Result){
                Content[LeIndex] = Result;
                LineResolve();
              },LineReject);
            } else if(CompilerCoffee.RegexOutput.test(Line)) {
              CompilerCoffee.ExtractPath(Line, FileDir).then(function(Result) {
                Opts.TargetFile = Result;
                Content[LeIndex] = '';
                LineResolve();
              }, LineReject);
            } else if(CompilerCoffee.RegexSourceMap.test(Line)) {
              CompilerCoffee.ExtractPath(Line, FileDir).then(function(Result){
                Content[LeIndex] = '';
                if(Result === ''){
                  Opts.SourceMap = null;
                } else {
                  Opts.SourceMap = Result;
                }
                LineResolve();
              });
            } else {
              LineResolve();
            }
          }));
        }
      });
      Promise.all(Promises).then(function(){
        ToReturn.Content = Content.join("\n");
        resolve(ToReturn);
      },reject);
    });
  }
  static Process(FilePath:String, Opts:Object):Promise{
    return new Promise(function(resolve,reject){
      FS.readFile(FilePath,function(Error,Content){
        if(Error){
          return reject(Error);
        }
        CompilerCoffee.Parse(FilePath,Content.toString().split("\n"),Opts).then(function(Result){
          Opts = Result.Opts;
          var
            HasSourceMap = Opts.SourceMap !== null,
            ToReturn = {
              Content: '',
              SourceMap: '',
              Opts: Opts
            },
            Output = null;
          CoffeeScript = CoffeeScript || require('coffee-script');
          try {
            Output = CoffeeScript.compile(Result.Content,{sourceMap:true});
          } catch(error){
            reject(error);
          }
          ToReturn.Content = Output.js;
          if(HasSourceMap){
            ToReturn.SourceMap = JSON.stringify(Output.v3SourceMap);
          }
          if((!Opts.SourceMap) && ToReturn.Content.substr(0,2) !== '#!'){
            UglifyJS = UglifyJS || require('uglify-js');
            Output = UglifyJS.minify(ToReturn.Content,{fromString: true,outSourceMap:HasSourceMap ? "js.map" : undefined});
            ToReturn.Content = Output.code;
            if(HasSourceMap){
              ToReturn.SourceMap = Output.map;
            }
          }
          if(HasSourceMap){
            ToReturn.Content += '//# sourceMappingURL='+H.Relative(Path.dirname(Opts.TargetFile), Opts.SourceMap);
          }
          resolve(ToReturn);
        },reject);
      })
    });
  }
}
module.exports = CompilerCoffee;