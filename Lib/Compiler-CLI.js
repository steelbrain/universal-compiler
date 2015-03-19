#!/usr/local/bin/iojs --es_staging


"use strict";
var
  Compiler = require('./Compiler/Index'),
  Opts = require('minimist')(process.argv.slice(2)),
  Log = require('debug'),
  FS = require('fs');
Log.enable('uc-compiler-cli');
Log = Log('uc-compiler-cli');
require('./Plugins/JS');
require('./Plugins/CSS');
require('./Plugins/Less');
require('./Plugins/Coffee');
require('./Plugins/SASS');
class CLI{
  static Init(){
    if(!Opts['_'].length){
      throw new Error("Please specify a file to compile");
    }
    Opts.Write = true;
    CLI.NormalizeOpts(Opts);
    Compiler.Compile(Opts['_'][0], Opts).then(function(FileInfo){
      if(FileInfo.Opts.Output && FileInfo.Opts.Write){
        try {
          FS.writeFileSync(FileInfo.Opts.Output, FileInfo.Result);
        } catch(error){
          return Log(`Permission denied, can't write output to file '${FileInfo.Opts.Output}'`);
        }
        if(FileInfo.Opts.SourceMap){
          try {
            FS.writeFileSync(FileInfo.Opts.SourceMap, FileInfo.SourceMap);
          } catch(error){
            return Log(`Permission denied, can't write sourcemap to file '${FileInfo.Opts.SourceMap}'`);
          }
        }
      } else {
        console.log(FileInfo.Result);
      }
    }, function(error){
      //Log(error.message);
      Log(error.stack);
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