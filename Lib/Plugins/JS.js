

"use strict";
if(typeof UniversalCompiler == 'undefined'){
  throw new Error("You must include Universal-Compiler First");
}
var
  KnownCompilers = ['BABEL','RIOT','REACT-TOOLS'],
  Babel = require('babel'),
  Riot = require('riot'),
  ReactTools = require('react-tools'),
  UglifyJS = require('uglify-js');
class PluginJS extends UniversalCompiler.PluginBase{
  constructor(){
    super();
    UniversalCompiler.H.Merge(this.DefaultOpts, {
      Compress: false,
      Transpiler: 'BABEL',
      Transpile: false
    });
    this.Tags.set('Compiler-Transpile',function (Extracts, Line, Number, SourceInfo) {
      SourceInfo.Opts.Transpile = Extracts[2] === 'true';
    });
    this.Tags.set('Compiler-Compress', function(Extracts, Line, Number, SourceInfo){
      SourceInfo.Opts.Compress = Extracts[2] === 'true';
    });
    this.Tags.set('Compiler-Name', function(Extracts, Line, Number, SourceInfo){
      Extracts[2] = Extracts[2].toUpperCase();
      if(KnownCompilers.indexOf(Extracts[2]) !== -1){
        SourceInfo.Opts.Transpiler = Extracts[2];
      }
    });
  }
  ProcessBabel(SourceInfo){
    var Output = Babel.transform(SourceInfo.Content,{
      sourceMap: Boolean(SourceInfo.Opts.SourceMap),
      sourceFileName: SourceInfo.FileName,
      filenameRelative: SourceInfo.FileName,
      playground: true
    });
    SourceInfo.Result = Output.code;
    SourceInfo.SourceMap = Output.map;
  }
  ProcessRiot(SourceInfo){
    SourceInfo.Result = Riot.compile(SourceInfo.Content,{compact:true});
  }
  ProcessReactTools(SourceInfo){
    var Output = ReactTools.transformWithDetails(SourceInfo.Content,{
      harmony:true,
      stripTypes:true,
      sourceMap: Boolean(SourceInfo.Opts.SourceMap),
      filename: SourceInfo.FileName
    });
    if(SourceInfo.Opts.SourceMap){
      Output.sourceMap.sources = [SourceInfo.FileName];
      SourceInfo.SourceMap = Output.sourceMap;
    }
    SourceInfo.Result = Output.code;
  }
  ProcessUglify(SourceInfo){
    SourceInfo.Result = UglifyJS.minify(SourceInfo.Result, {fromString: true}).code;
    SourceInfo.SourceMap = '';
    SourceInfo.Opts.SourceMap = null;
  }
  PreProcess(SourceInfo){
    if(SourceInfo.Extension === 'TAG'){
      SourceInfo.Opts.Transpiler = 'RIOT';
    }
  }
  PostProcess(SourceInfo){
    var Self = this;
    return new Promise(function(Resolve){
      if(SourceInfo.Opts.Transpile){
        UniversalCompiler.Debug(`JS::PostProcess Gonna Transpile through '${SourceInfo.Opts.Transpiler}'`);
        SourceInfo.Opts.Transpiler = SourceInfo.Opts.Transpiler.toString().toUpperCase();
        if(SourceInfo.Opts.Transpiler === 'BABEL'){
          Self.ProcessBabel(SourceInfo);
        } else if(SourceInfo.Opts.Transpiler === 'REACT-TOOLS'){
          Self.ProcessReactTools(SourceInfo);
        } else if(SourceInfo.Opts.Transpiler === 'RIOT'){
          self.ProcessRiot(SourceInfo);
        }
      }
      if(SourceInfo.Opts.Compress){
        Self.ProcessUglify(SourceInfo);
      }
      if(SourceInfo.Opts.SourceMap){
        SourceInfo.Result += '//# sourceMappingURL=' + UniversalCompiler.H.Relative(SourceInfo.Directory, SourceInfo.Opts.SourceMap);
      }
      Resolve(SourceInfo);
    });
  }
}
var PluginJSInst = new PluginJS;
UniversalCompiler.RegisterPlugin('JS', PluginJSInst);
UniversalCompiler.RegisterPlugin('JSX', PluginJSInst);
UniversalCompiler.RegisterPlugin('TAG', PluginJSInst);