

"use strict";

require('coffee-script/register');

var
  Debug = require('debug')('uc-compiler'),
  H = require('../H'),
  FileInfo = require('./FileInfo');

class Compiler{
  static RegisterPlugin(Extensions, PluginClass){
    if(!(PluginClass instanceof Compiler.PluginBase)){
      throw new Error("The Plugin should be an instance of Compiler.PluginBase");
    }
    if(Extensions instanceof Array){
      Extensions.forEach(function(Extension){
        Compiler.Plugins.set(Extension, PluginClass);
      });
    } else if(typeof Extensions === 'string') {
      Compiler.Plugins.set(Extensions, PluginClass);
    }
  }
  static Compile(SourceFile, Opts){
    Debug('Compiler::Compile Gonna Compiler', SourceFile);

    var SourceInfo, CompilerPlugin;

    return new Promise(function(Resolve, Reject){
      SourceInfo = new FileInfo(SourceFile);
      if(!SourceInfo.Readable){
        return Reject(new Error(`Source File ${SourceFile} isn't readable`));
      }
      if(!Compiler.Plugins.has(SourceInfo.Extension)){
        return Reject(new Error(`The Extension ${SourceInfo.Extension} is not registered`));
      }
      CompilerPlugin = Compiler.Plugins.get(SourceInfo.Extension);
      SourceInfo.Opts = H.Merge({}, Compiler.DefaultOpts, Opts, CompilerPlugin.DefaultOpts);
      CompilerPlugin.Process(SourceInfo, Opts).then(function(){
        Resolve(SourceInfo);
      }, Reject);
    });
  }
}
Compiler.H = H;
Compiler.Debug = Debug;
Compiler.Plugins = new Map;
Compiler.DefaultOpts = {TargetFile: null, SourceMap: null, Write:false};
Compiler.PluginBase = require('./PluginBase');

global.UniversalCompiler = Compiler;
module.exports = Compiler;