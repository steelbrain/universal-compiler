#!/usr/bin/env nodejs


require('coffee-script/register');
var
  Compiler = require('../Compiler/Compiler').Compiler,
  WatcherControl = require('../Watcher/Watcher').WatcherControl,
  WatcherInst = null,
  Args = require('minimist')(process.argv.slice(2)),
  TheArgs = {
    Dir:Args['_'] && Args['_'][0] || '.',
    Excluded: (Args['exclude'] && Args['exclude'].split(',')) || (Args['e'] && Args['e'].split(',')) || []
  };
WatcherInst = WatcherControl.Watch(TheArgs.Dir);
WatcherInst.Init(TheArgs.Excluded).then(function(){
  console.log(WatcherInst.Manifest);
});