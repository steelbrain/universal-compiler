

"use strict";
var
  Compiler = module.parent.exports,
  FS = require('fs');
class CompilerBase{
  constructor(){
    this.DefaultOpts = {};
    this.ExtractValue = /@([a-zA-z1-9-]*) "(.*)"/;
    this.Tags = new Map([
      ['Compiler-Output', function(Extracts, Line, Number, SourceInfo){
        SourceInfo.Opts.TargetFile = Compiler.H.ABSPath(Extracts[2],SourceInfo.Directory);
      }],
      ['Compiler-SourceMap', function(Extracts, Line, Number, SourceInfo){
        SourceInfo.Opts.SourceMap = Compiler.H.ABSPath(Extracts[2],SourceInfo.Directory);
      }]
    ]);
    this.CommentBlock = '//';
  }
  ParseLine(Line, Number, SourceInfo){
    var
      Self = this,
      Extracts = null,
      CallbackRetVal = null;
    return new Promise(function(Resolve, Reject){
      Extracts = Self.ExtractValue.exec(Line);
      if(!Extracts || !Extracts.length || Extracts.length !== 3 || !Self.Tags.has(Extracts[1])) return ;
      if((CallbackRetVal = Self.Tags.get(Extracts[1])(Extracts, Line, Number, SourceInfo)) instanceof Promise){
        CallbackRetVal.then(function(CallbackRetVal){
          SourceInfo.Content[Number] = CallbackRetVal || '';
          Resolve();
        }, Reject);
      } else {
        SourceInfo.Content[Number] = CallbackRetVal || '';
        Resolve();
      }
    });
  }
  Process(SourceInfo){
    var
      Self = this,
      Promises = [],
      PostProcessRetVal = null;
    return new Promise(function(Resolve,Reject){
      FS.readFile(SourceInfo.Path, function(_, Data){
        SourceInfo.Content = Data.toString();
        SourceInfo.Content = SourceInfo.Content.split(SourceInfo.Content.indexOf("\r") > -1 ? "\r\n" : "\n");
        SourceInfo.Content.forEach(function(Line, Number){
          if(Line.indexOf(Self.CommentBlock) === -1) return ;
          Promises.push(Self.ParseLine(Line, Number, SourceInfo));
        });
        Promise.all(Promises).then(function(){
          SourceInfo.Content = SourceInfo.Content.join("\n");
          SourceInfo.Result = SourceInfo.Content;
          SourceInfo.SourceMap = null;
          if(Self.PostProcess){
            if((PostProcessRetVal = Self.PostProcess(SourceInfo)) instanceof Promise){
              Promise.then(Resolve);
            } else {
              Resolve();
            }
          } else {
            Resolve();
          }
        }, Reject);
      });
    });
  }
}
module.exports = CompilerBase;