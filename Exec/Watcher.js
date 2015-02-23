#!/usr/local/bin/babel-node -g

var
  {Compiler} = require('../Built/Compiler/Compiler'),
  {WatcherControl} = require('../Built/Watcher/Watcher');
if(!process.argv[2]){
  console.log("Please Specify a Directory to watch");
  process.exit(1);
}
WatcherControl.Watch(process.argv[2],{AutoCompile:true});