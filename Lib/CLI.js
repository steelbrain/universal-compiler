#!/usr/local/bin/iojs --es_staging


"use strict";
var
  Compiler = require('./Compiler/Index'),
  Opts = require('minimist')(process.argv.slice(2)),
  Log = require('debug');
Log.enable('uc-compiler-cli');
Log = Log('uc-compiler-cli');
require('./Plugins/JS');
class CLI{
  static Init(){
    if(!Opts['_'].length){
      throw new Error("Please specify a file to compile");
    }
    Opts.Write = true;
    CLI.NormalizeOpts(Opts);
    Compiler.Compile(Opts['_'][0], Opts).then(function(FileInfo){
      console.log(arguments);
    }, function(error){
      Log(error.message);
    });
  }
  static NormalizeOpts(Opts){
    var Key, Value;
    for(Key in Opts){
      if(Opts.hasOwnProperty(Key)){
        if(Opts[Key] === 'true'){
          Opts[Key] = true;
        } else if(Opts[Key] === 'false'){
          Opts[Key] = false;
        }
      }
    }
  }
}
try {
  CLI.Init();
} catch(error){
  Log(error.message);
}