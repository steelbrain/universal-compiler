#!/usr/bin/env nodejs
// @Compiler-Output "../Built-Bin/Watcher.js"


var
  Compiler = require('./../Built/Compiler');
if(!process.argv[2]){
  console.log("Please Specify a Directory to watch");
  process.exit(1);
}
Compiler = new Compiler();
Compiler.Watch(process.argv[2],{AutoCompile:true});