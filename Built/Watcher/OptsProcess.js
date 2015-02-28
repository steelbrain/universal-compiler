(function() {
  var FS, Promise;

  FS = require('fs');

  Promise = require('a-promise');

  module.exports = {
    Default: function(ProjectDir, FileInfo, Opts, ResultOpts) {
      var ReturnVal;
      global.uc_watcher_debug("OptsProcess::Default Enter");
      ReturnVal = false;
      return new Promise(function(Resolve) {
        var Temp;
        if (ResultOpts.TargetFile !== null && ResultOpts.TargetFile !== Opts.Output) {
          if (!FS.existsSync(ResultOpts.TargetFile)) {
            FS.writeFileSync(ResultOpts.TargetFile, '');
          }
          Temp = FS.realpathSync(ResultOpts.TargetFile).substr(ProjectDir.length + 1);
          if (Temp !== Opts.Output) {
            Opts.Output = Temp;
            ReturnVal = true;
          }
        }
        if (ResultOpts.SourceMap !== null && ResultOpts.SourceMap !== Opts.Output) {
          if (!FS.existsSync(ResultOpts.SourceMap)) {
            FS.writeFileSync(ResultOpts.SourceMap, '');
          }
          Temp = FS.realpathSync(ResultOpts.SourceMap).substr(ProjectDir.length + 1);
          if (Temp !== Opts.SourceMap) {
            Opts.SourceMap = Temp;
            ReturnVal = true;
          }
        }
        if (ResultOpts.Compress !== Opts.Compress) {
          Opts.Compress = ResultOpts.Compress;
          ReturnVal = true;
        }
        global.uc_watcher_debug("OptsProcess::Default Return Value " + ReturnVal);
        return Resolve(ReturnVal);
      });
    },
    JS: function(ProjectDir, FileInfo, Opts, ResultOpts) {
      var ReturnVal;
      ReturnVal = false;
      return new Promise(function(Resolve) {
        if (ResultOpts.Compiler !== Opts.Compiler) {
          Opts.Compiler = ResultOpts.Compiler;
          ReturnVal = true;
        }
        return Resolve(ReturnVal);
      });
    },
    CSS: function() {
      return new Promise(function(Resolve) {
        return Resolve(false);
      });
    }
  };

}).call(this);
