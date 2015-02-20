

// @Compiler-Output "../../Build/Plugins/Compiler-JS.js"
var
  Promise = require('a-promise'),
  UglifyJS = null,
  Babel = null,
  Riot = null,
  ReactTools = null,
  FS = require('fs'),
  Path = require('path'),
  H = require('../H');
class CompilerJS{
  static RegexAppend:RegExp = /@(codekit-append|prepros-append|Compiler-Append)/;
  static RegexOutput:RegExp = /@Compiler-Output/;
  static RegexCompiler:RegExp = /@Compiler-Name/;
  static RegexSourceMap:RegExp = /@Compiler-Sourcemap/;
  static RegexExtract:RegExp = /".*"/;
  static ExtractValue(Line:String):Promise{
    return new Promise(function(resolve,reject){
      var Result = CompilerJS.RegexExtract.exec(Line);
      if (!Result.length) {
        return reject(); // Skip empty "@codekit-append"
      }
      Result = Result[0].substr(1, Result[0].length - 2);
      resolve(Result);
    });
  }
  static ExtractPath(Line:String, FileDir:String):Promise{
    return new Promise(function(resolve,reject){
      CompilerJS.ExtractValue(Line).then(function(Result:String){
        if (Result.substr(0, 1) !== Path.sep &&
          Result.substr(1, 1) !== ':') { // Windows Drive `D:\`
          Result = FileDir + Path.sep + Result;
        }
        resolve(Result);
      },reject);
    });
  }

  static ParseAppend(Line:String, FileDir: String, FilePath:String):Promise{
    return new Promise(function(resolve,reject){
      CompilerJS.ExtractPath(Line, FileDir).then(function(Result){
        FS.readFile(Result, function (Error, LeContents) {
          if (Error) {
            return reject(`The File '${Result} doesn't exist, It was imported in ${FilePath}'`);
          }
          resolve(LeContents.toString());
        });
      },reject);
    });
  }
  static ParseCompiler(Line:String):Promise{
    return new Promise(function(resolve,reject){
      CompilerJS.ExtractValue(Line).then(function (Result) {
        Result = Result.toUpperCase();
        if (Result === 'BABEL') {
          resolve('Babel');
        } else if (Result === 'REACTTOOLS') {
          resolve('ReactTools');
        } else if (Result === 'RIOT') {
          resolve('Riot');
        } else if (Result === '') {
          resolve(null);
        } else {
          resolve();
        }
      }, reject);
    });
  }
  static Parse(FilePath:String, Contents:Array, Opts:Object):Promise{
    return new Promise(function(resolve,reject){
      var
        ToReturn = {Contents: "", Opts: Opts},
        FileDir = Path.dirname(FilePath),
        Promises = [];
      Contents.forEach(function(Line:String, LeIndex:Number){
        var Index;
        if(Line.indexOf('//') !== -1){
          Promises.push(new Promise(function(LineResolve,LineReject){
            Line = Line.trim();
            Index = Line.indexOf('//');
            if(Index === -1 || Index !== 0){
              return LineResolve(); // Ignore non-commented lines or lines with stuff + comments
            }
            if(CompilerJS.RegexAppend.test(Line)) {
              CompilerJS.ParseAppend(Line, FileDir,FilePath).then(function(Result){
                Contents[LeIndex] = Result;
                LineResolve();
              },LineReject);
            } else if(CompilerJS.RegexOutput.test(Line)) {
              CompilerJS.ExtractPath(Line, FileDir).then(function(Result) {
                Opts.TargetFile = Result;
                LineResolve();
              }, LineReject);
            } else if(CompilerJS.RegexCompiler.test(Line)) {
              CompilerJS.ParseCompiler(Line).then(function(Compiler){
                Opts.Compiler = Compiler;
                LineResolve();
              },LineReject);
            } else if(CompilerJS.RegexSourceMap.test(Line)) {
              CompilerJS.ExtractPath(Line, FileDir).then(function(Result){
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
        ToReturn.Contents = Contents.join("\n");
        resolve(ToReturn);
      },reject);
    });
  }
  static Process(FilePath:String, Opts:Object):Promise{
    return new Promise(function(resolve,reject){
      FS.readFile(FilePath,function(Error,Contents){
        if(Error){
          return reject(Error);
        }
        CompilerJS.Parse(FilePath,Contents.toString().split("\n"),Opts).then(function(Result){
          Opts = Result.Opts;
          var
            HasSourceMap = Opts.SourceMap !== null,
            ToReturn = {
              Content: '',
              SourceMap: '',
              Opts: Opts
            },
            Output = null;
          if(Opts.Compiler === 'Babel'){
            Babel = Babel || require('babel');
            Output = Babel.transform(Result.Contents,{sourceMap:HasSourceMap, playground:true, experimental:true});
            ToReturn.Content = Output.code;
            if(HasSourceMap){
              ToReturn.SourceMap = JSON.stringify(Output.map);
            }
          } else if(Opts.Compiler === 'ReactTools'){
            ReactTools = ReactTools || require('react-tools');
            Output = ReactTools.transformWithDetails(Result.Contents,{harmony:true,stripTypes:true,sourceMap:HasSourceMap});
            ToReturn.Content = Output.code;
            if(HasSourceMap){
              ToReturn.SourceMap = JSON.stringify(Output.sourceMap);
            }
          } else if(Opts.Compiler === 'Riot'){
            Riot = Riot || require('riot');
            ToReturn.Content = Riot.compile(Result.Contents,{compact:true});
          }
          if(((!Opts.Compiler && Opts.SourceMap) || !Opts.SourceMap) && ToReturn.Content.substr(0,2) !== '#!'){
            UglifyJS = UglifyJS || require('uglify-js');
            Output = UglifyJS.minify(ToReturn.Content || Result.Content,{fromString: true,outSourceMap:HasSourceMap ? "js.map" : undefined});
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
module.exports = CompilerJS;