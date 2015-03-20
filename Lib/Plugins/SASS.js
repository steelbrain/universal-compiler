

"use strict";
if(typeof UniversalCompiler == 'undefined'){
  throw new Error("You must include Universal-Compiler First");
}
var SASS = require('node-sass');
class PluginSASS extends UniversalCompiler.PluginBase{
  constructor(){
    super();
    UniversalCompiler.H.Merge(this.DefaultOpts, {
      Compress: false
    });
    this.Tags.set('Compiler-Compress', function(Extracts, Line, Number, SourceInfo){
      SourceInfo.Opts.Compress = Extracts[2] === 'true';
    });
    this.CommentBlock = '//';
  }
  PostProcess(SourceInfo){
    return new Promise(function(Resolve, Reject){
      SASS.render({
        data: SourceInfo.Result,
        file: SourceInfo.Path,
        outputStyle: SourceInfo.Opts.Compress ? 'compressed' : 'nested',
        sourceMap: SourceInfo.Opts.SourceMap
      }, function(Error, Result){
        if(Error) return Reject(Error);
        SourceInfo.Result = Result.css.toString();
        SourceInfo.SourceMap = Result.map;
        Resolve();
      });
    });
  }
}
var SASSPluginInst = new PluginSASS;
UniversalCompiler.RegisterPlugin('SCSS', SASSPluginInst);
UniversalCompiler.RegisterPlugin('SASS', SASSPluginInst);