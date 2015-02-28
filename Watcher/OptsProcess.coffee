

# @Compiler-Output "../Built/Watcher/OptsProcess.js"
FS = require 'fs'
Promise = require 'a-promise'
module.exports =
  Default:(ProjectDir, FileInfo, Opts, ResultOpts)->
    global.uc_watcher_debug "OptsProcess::Default Enter"
    ReturnVal = false
    return new Promise (Resolve)->
      if ResultOpts.TargetFile isnt null and ResultOpts.TargetFile isnt Opts.Output
        if !FS.existsSync ResultOpts.TargetFile
          FS.writeFileSync ResultOpts.TargetFile,''
        Temp = FS.realpathSync ResultOpts.TargetFile
        if Temp isnt Opts.Output
          Opts.Output = Temp
          ReturnVal = true
      if ResultOpts.SourceMap isnt null and ResultOpts.SourceMap isnt Opts.Output
        if !FS.existsSync ResultOpts.SourceMap
          FS.writeFileSync ResultOpts.SourceMap,''
        Temp = FS.realpathSync ResultOpts.SourceMap
        if Temp isnt Opts.SourceMap
          Opts.SourceMap = Temp
          ReturnVal = true
      if ResultOpts.Compress isnt Opts.Compress
        Opts.Compress = ResultOpts.Compress
        ReturnVal = true
      global.uc_watcher_debug "OptsProcess::Default Return Value #{ReturnVal}"
      Resolve ReturnVal
  JS:->
    return new Promise (Resolve)->
      Resolve false
  CSS:->
    return new Promise (Resolve)->
      Resolve false