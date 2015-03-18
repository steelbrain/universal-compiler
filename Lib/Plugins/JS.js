

"use strict";
if(typeof UniversalCompiler == 'undefined'){
  throw new Error("You must include Universal-Compiler First");
}
class PluginJS extends UniversalCompiler.PluginBase{
  constructor(){
    super();
    UniversalCompiler.H.Merge(this.DefaultOpts, {
      Compress: false,
      Transpiler: 'Babel',
      Transpile: false
    });
    this.Tags.set('Compiler-Transpile',function (Extracts, Line, Number, SourceInfo) {
      SourceInfo.Opts.Transpile = Extracts[2] === 'true';
    });
    this.Tags.set('Compiler-Compress', function(Extracts, Line, Number, SourceInfo){
      SourceInfo.Opts.Compress = Extracts[2] === 'true';
    });
  }
}
UniversalCompiler.RegisterPlugin('JS', new PluginJS);