

"use strict";
if(typeof UniversalCompiler == 'undefined'){
  throw new Error("You must include Universal-Compiler First");
}
var
  Less = uc_require('less');
class PluginLess extends UniversalCompiler.PluginBase{
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
      Less.render(SourceInfo.Result, {
        sourceMap: true,
        filename: SourceInfo.Path,
        paths: [SourceInfo.Directory],
        compress: SourceInfo.Opts.Compress
      }).then(function(LeResult){
        SourceInfo.Result = LeResult.css;
        if(SourceInfo.Opts.SourceMap){
          SourceInfo.Result += '/*# sourceMappingURL=' + SourceInfo.Opts.SourceMap + ' */';
        }
        Resolve();
      }, Reject);
    });
  }
}
UniversalCompiler.RegisterPlugin('LESS', new PluginLess);