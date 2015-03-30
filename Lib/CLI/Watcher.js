

"use strict";
module.exports = function(Opts, Watcher, FS, Log){
  class CLI{
    static Init(){
      if(!Opts['_'].length){
        throw new Error("Please specify a directory to watch");
      }
      Opts.Watch = true;
      Opts.Excluded = Opts.Excluded ? Opts.Excluded.split(',') : [];
      try {
        var Stats = FS.statSync(Opts['_'][0]);
      } catch(err){
        throw new Error(`The directory '${Opts['_'][0]}' doesn't exist`);
      }
      if(!Stats.isDirectory()){
        throw new Error(`The input '${Opts['_'][0]}' is not a directory`);
      }
      UniversalCompiler.H.NormalizeOpts(Opts);
      Watcher.Watch(Opts['_'][0], function(){}, Opts.Excluded);
    }
  }
  return CLI;
};