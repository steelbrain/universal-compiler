

// @Compiler-Output "../../Build/Plugins/Compiler-LESS.js"
var
  Promise = require('a-promise'),
  LESS = null,
  FS = require('fs'),
  Path = require('path'),
  H = require('../H'),
  Compiler = null;
class CompilerLESS{
  static RegexAppend:RegExp = /@(codekit-append|prepros-append|Compiler-Append)/;
  static RegexOutput:RegExp = /@Compiler-Output/;
  static RegexSourceMap:RegExp = /@Compiler-Sourcemap/;
  static RegexExtract:RegExp = /".*"/;
  static init(LeCompiler):void{
    Compiler = LeCompiler;
  }

  static ExtractValue(Line:String):Promise{
    return new Promise(function(resolve,reject){
      var Result = CompilerLESS.RegexExtract.exec(Line);
      if (!Result.length) {
        return reject(); // Skip empty "@codekit-append"
      }
      Result = Result[0].substr(1, Result[0].length - 2);
      resolve(Result);
    });
  }
  static ExtractPath(Line:String, FileDir:String):Promise{
    return new Promise(function(resolve,reject){
      CompilerLESS.ExtractValue(Line).then(function(Result:String){
        if (Result.substr(0, 1) !== Path.sep &&
          Result.substr(1, 1) !== ':') { // Windows Drive `D:\`
          Result = FileDir + Path.sep + Result;
        }
        resolve(Result);
      },reject);
    });
  }

  static ParseAppend(Line:String, FileDir: String, FilePath:String,HasSourceMap:Boolean):Promise{
    return new Promise(function(resolve,reject){
      CompilerLESS.ExtractPath(Line, FileDir).then(function(Result){
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
        if(Line.indexOf('//') !== -1){
          Promises.push(new Promise(function(LineResolve,LineReject){
            Line = Line.trim();
            Index = Line.indexOf('//');
            if(Index === -1 || Index !== 0){
              return LineResolve(); // Ignore non-commented lines or lines with stuff + comments
            }
            if(CompilerLESS.RegexAppend.test(Line)) {
              CompilerLESS.ParseAppend(Line, FileDir,FilePath,!!Opts.SourceMap).then(function(Result){
                Content[LeIndex] = Result;
                LineResolve();
              },LineReject);
            } else if(CompilerLESS.RegexOutput.test(Line)) {
              CompilerLESS.ExtractPath(Line, FileDir).then(function(Result) {
                Opts.TargetFile = Result;
                Content[LeIndex] = '';
                LineResolve();
              }, LineReject);
            } else if(CompilerLESS.RegexSourceMap.test(Line)) {
              CompilerLESS.ExtractPath(Line, FileDir).then(function(Result){
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
        CompilerLESS.Parse(FilePath,Content.toString().split("\n"),Opts).then(function(Result){
          Opts = Result.Opts;
          var
            HasSourceMap = Opts.SourceMap !== null,
            ToReturn = {
              Content: '',
              SourceMap: '',
              Opts: Opts
            },
            SourceMapURL = HasSourceMap ? H.Relative(Path.dirname(Opts.TargetFile), Opts.SourceMap) : null,
            FileDir = Path.dirname(FilePath),
            Temp = null;
          LESS = LESS || require('less');
          LESS.render(Result.Content,{
            sourceMap: true,
            filename: FilePath,
            paths: [FileDir],
            compress: !HasSourceMap
          }).then(function(LeResult){
            ToReturn.Content = LeResult.css;
            if(HasSourceMap){
              Temp = {Map: JSON.parse(LeResult.map),Files:[], SourceMapDir: Opts.SourceMap.split(Path.sep)};
              Temp.SourceMapDir.pop();
              Temp.SourceMapDir = Temp.SourceMapDir.join(Path.sep);
              Temp.Map.sources.forEach(function(File){
                Temp.Files.push(H.Relative(Temp.SourceMapDir,File));
              });
              Temp.Map.sources = Temp.Files;
              ToReturn.SourceMap = JSON.stringify(Temp.Map);
              ToReturn.Content += '/*# sourceMappingURL=' + SourceMapURL + ' */';
            }
            resolve(ToReturn);
          },reject);
        },reject);
      })
    });
  }
}
module.exports = CompilerLESS;