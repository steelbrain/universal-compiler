

// @Compiler-Output "../../Built/Compiler/Abstract/Compiler-Base.js"
// @Compiler-Transpile "true"
var
  Path = require('path'),
  Promise = require('a-promise'),
  H = require('../../Misc/H')();
module.exports = function(Compiler){
  class CompilerBase{
    static RegexLineInfo:RegExp = /@([a-zA-z1-9-]*) "(.*)"/;
    static DefaultTags:Object = [
      {
        Tags: ['Compiler-Output'],
        Callback: function(Info,Opts,Content,Line,Index,FileDir):void{
          Opts.TargetFile = H.ABSPath(Info[2],FileDir);
        }
      },
      {
        Tags: ['Compiler-Sourcemap', 'Compiler-SourceMap'],
        Callback: function(Info,Opts,Content,Line,Index,FileDir):void{
          Opts.SourceMap = H.ABSPath(Info[2],FileDir);
        }
      },
      {
        Tags: ['Compiler-Compress'],
        Callback: function(Info,Opts):void{
          Opts.Compress = Info[2] === 'true';
        }
      },
      {
        Tags: ['Compiler-Include'],
        Callback: function(Info,Opts,Content,Line,Index,FileDir):Promise{
          Opts.IncludedFiles.push(H.ABSPath(Info[2],FileDir));
          return new Promise(function(Resolve,Reject){
            Compiler.Compile(H.ABSPath(Info[2],FileDir),{Write:false}).then(function(Result){
              Resolve(Result.Content);
            },Reject);
          });
        }
      }
    ];
    Map:Object;
    ParseLine(FilePath:String, FileDir:String, Content:Array, Opts:Object, Line:String, Index:Number):Promise{
      return new Promise(function(Resolve,Reject){
        var
          Valid = false,
          Info = null,
          Result = null,
          Tag = null;
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
        if(!Info || Info.length !== 3){
          return Resolve();
        }
        this.Map.Tags.forEach(function(TagEntry){
          if(TagEntry.Tags.indexOf(Info[1]) !== -1){
            Tag = TagEntry;
          }
        });
        Tag || CompilerBase.DefaultTags.forEach(function(TagEntry){
          if(TagEntry.Tags.indexOf(Info[1]) !== -1){
            Tag = TagEntry;
          }
        });
        if(Tag === null){
          return Resolve();
        }
        Result = Tag.Callback(Info,Opts,Content,Line,Index,FileDir,FilePath);
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
  return CompilerBase;
};