#!/usr/bin/env iojs


"use strict";
var
  Compiler = require('../Compiler'),
  Opts = require('minimist')(process.argv.slice(2)),
  Log = require('debug'),
  FS = require('fs');
Log.enable('uc-compiler-cli');
Log = Log('uc-compiler-cli');
try {
  if(!Opts['_'].length){
    throw new Error("Please specify a file to compile");
  }
  Opts.Write = true;
  UniversalCompiler.H.NormalizeOpts(Opts);
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
} catch(error){
  Log(error.message);
}