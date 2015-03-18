

"use strict";

require('coffee-script/register');

var
  FS = require('fs'),
  Debug = require('debug')('uc-compiler'),
  H = require('../H');

class Compiler{
  static RegisterPlugin(Extensions, PluginClass){
    if(!(PluginClass instanceof Compiler.PluginBase)){
      throw new Error("The Plugin should be an instance of Compiler.PluginBase");
    }
    if(Extensions instanceof Array){
      Extensions.forEach(function(Extension){
        global.uc_compiler_debug(`Registering Plugin ${PluginClass.constructor.name} for Extension ${Extension}`);
        Compiler[Extension] = PluginClass
      });
    } else if(typeof Extensions === 'string') {
      global.uc_compiler_debug(`Registering Plugin ${PluginClass.constructor.name} for Extension ${Extensions}`);
      Compiler[Extensions] = PluginClass;
    }
  }
  static Compile(SourceFile, Opts){
    Debug(`Compiler::Compile Gonna Compiler ${SourceFile}`);
    return new Promise(function(Resolve, Reject){

    });
  }
}
module.exports = Compiler;
Compiler.Debug = Debug;
Compiler.Plugins = {};
Compiler.PluginBase = require('./PluginBase');
Compiler.Compile('/tmp/njs/1.js');