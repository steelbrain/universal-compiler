

// @Compiler-Output "../../Built/Compiler/Abstract/Compiler-Base.js"
var
  Path = require('path'),
  FS = require('fs'),
  Promise = require('a-promise'),
  H = require('../H');
export class CompilerBase{
  static RegexLineInfo:RegExp = /@([a-zA-z1-9-]*) "(.*)"/;
  Map:Object;
  ParseLine(FilePath:String, FileDir:String, Content:Array, Opts:Object, Line:String, Index:Number):Promise{
    return new Promise(function(Resolve,Reject){
      var
        Valid = false,
        Info = null,
        Result = null;
      Line = Line.trim();
      this.Map.Comments.forEach(function(Comment){
        if(Line.substr(0,Comment.length) === Comment){
          Valid = true;
        }
      });
      if(!Valid){
        return Resolve();
      }
      Info = CompilerBase.RegexLineInfo.exec(Line);
      if(!Info || Info.length !== 3 || !this.Map.Tags.hasOwnProperty(Info[1])){
        return Resolve();
      }
      Result = this.Map.Tags[Info[1]](Info,Opts,Content,Line,Index,FileDir,FilePath);
      if(typeof Result !== 'undefined'){
        if(Result.then){
          Result.then(function(Result){
            Content[Index] = Result;
            Resolve();
          },Reject);
        } else {
          Content[Index] = Result;
          Resolve();
        }
      } else {
        Content[Index] = '';
        Resolve();
      }
    }.bind(this));
  }
  Parse(FilePath:String, Content:Array, Opts:Object):Promise{
    Content = Content.split(/\r\n|\r|\n/);
    return new Promise(function(Resolve,Reject){
      if(!Content.length){
        return Resolve({Opts,Content});
      }
      var
        Promises = [],
        FileDir = Path.dirname(FilePath);
      if(Content[0].substr(0,2) === '#!'){
        // Shebang
        Opts.Shebang = Content[0];
        Content[0] = '';
      }
      Content.forEach(function(Line:String, Index:Number){
        Promises.push(this.ParseLine(FilePath,FileDir,Content,Opts,Line,Index));
      }.bind(this));
      Promise.all(Promises).then(function(){
        Content = Content.join("\n");
        return Resolve({Opts,Content});
      },Reject);
    }.bind(this));
  }
}