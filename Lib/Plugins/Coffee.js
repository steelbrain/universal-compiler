

"use strict";
if(typeof UniversalCompiler == 'undefined'){
  throw new Error("You must include Universal-Compiler First");
}
var
  Coffee = require('coffee-script'),
  UglifyJS = require('uglify-js');
class PluginCoffee extends UniversalCompiler.PluginBase{
  constructor(){
    super();
    UniversalCompiler.H.Merge(this.DefaultOpts, {
      Compress: false,
      Bare: false
    });
    this.Tags.set('Compiler-Compress', function(Extracts, Line, Number, SourceInfo){
      SourceInfo.Opts.Compress = Extracts[2] === 'true';
    });
    this.Tags.set('Compiler-Bare', function(Extracts, Line, Number, SourceInfo){
      SourceInfo.Opts.Bare = Extracts[2] === 'true';
    });
    this.CommentBlock = '//';
  }
  ProcessUglify(SourceInfo){
    SourceInfo.Result = UglifyJS.minify(SourceInfo.Result, {fromString: true}).code;
    SourceInfo.SourceMap = '';
    SourceInfo.Opts.SourceMap = null;
  }
  PostProcess(SourceInfo){
    var Self = this;
    return new Promise(function(Resolve, Reject){
      var Output = Coffee.compile(SourceInfo.Result, {
        sourceMap: true,
        sourceFiles: [SourceInfo.FileName],
        inline: true,
        generatedFile:SourceInfo.FileName,
        bare: SourceInfo.Opts.Bare
      });
      SourceInfo.Result = Output.js;
      if(SourceInfo.Opts.SourceMap !== null){
        SourceInfo.SourceMap = Output.v3SourceMap;
      }
      if(SourceInfo.Opts.Compress){
        Self.ProcessUglify(SourceInfo);
      }
      Resolve();
    });
  }
}
UniversalCompiler.RegisterPlugin('COFFEE', new PluginCoffee);