

"use strict";
if(typeof UniversalCompiler == 'undefined'){
  throw new Error("You must include Universal-Compiler First");
}
class PluginJS extends UniversalCompiler.PluginBase{
  constructor(){
    super();
    UniversalCompiler.H.Merge(this.DefaultOpts, {
      Compress: false,
      Compiler: 'Babel',
      Transpile: false
    });
  }
}
UniversalCompiler.RegisterPlugin('JS', new PluginJS);