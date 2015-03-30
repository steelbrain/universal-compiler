

"use strict";
if(typeof UniversalCompiler == 'undefined'){
  throw new Error("You must include Universal-Compiler First");
}
var CleanCSS = new (uc_require('clean-css'))({sourceMap: true});
class PluginCSS extends UniversalCompiler.PluginBase{
  constructor(){
    super();
    UniversalCompiler.H.Merge(this.DefaultOpts, {
      Compress: false
    });
    this.Tags.set('Compiler-Compress', function(Extracts, Line, Number, SourceInfo){
      SourceInfo.Opts.Compress = Extracts[2] === 'true';
    });
    this.CommentBlock = '/*';
  }
  ProcessUglify(SourceInfo){
    return new Promise(function(Resolve, Reject){
      CleanCSS.minify(SourceInfo.Result, function(Errors, Minified){
        if(Errors) return Reject(Errors);
        SourceInfo.Result = Minified.styles;
        SourceInfo.SourceMap = JSON.parse(Minified.sourceMap.toString());
        SourceInfo.SourceMap.sources = [SourceInfo.FileName];
        SourceInfo.SourceMap = JSON.stringify(SourceInfo.SourceMap);
        Resolve();
      });
    });
  }
  PostProcess(SourceInfo){
    var Self = this;
    return new Promise(function(Resolve, Reject){
      if(SourceInfo.Opts.Compress){
        Self.ProcessUglify(SourceInfo).then(function(){
          if(SourceInfo.Opts.SourceMap){
            SourceInfo.Result += '/*# sourceMappingURL=' + UniversalCompiler.H.Relative(SourceInfo.Directory, SourceInfo.Opts.SourceMap) + ' */';
          }
          Resolve(SourceInfo);
        }, Reject);
      } else {
        Resolve(SourceInfo);
      }
    });
  }
}
UniversalCompiler.RegisterPlugin('CSS', new PluginCSS);