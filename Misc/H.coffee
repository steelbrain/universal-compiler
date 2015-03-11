

# @Compiler-Output "../Built/Misc/H.js"
Path = require 'path'
Promise = require 'a-promise'
FS = require 'fs'


module.exports = (WatcherControl)->
  class H
    @ExcludedFiles = ['.git', '.idea', 'Built', 'Build', 'build', 'built', 'node_modules']
    @FileDir:(FilePath)->
      FilePath = FilePath.split(Path.sep);
      FilePath.pop();
      return FilePath.join(Path.sep);
    @FileName:(Basename)->
      Basename = Basename.split('.')
      Basename.pop()
      Basename
    @FileInfo:(FullPath, RelativePath, Name)->
      NameChunks = Name.split('.')
      Ext = NameChunks.pop().toUpperCase()
      return unless WatcherControl.FileTypes.hasOwnProperty Ext
      if RelativePath isnt '' then RelativePath = RelativePath + Path.sep
      FileInfo =
        Path: RelativePath + Name,
        Name:Name,
        Ext:Ext,
        Config: H.Merge({},WatcherControl.FileTypes[Ext]),
        Type: WatcherControl.FileTypesProcessedExt[Ext].toUpperCase()
      FileInfo.Config.Output = RelativePath + H.FileName(FileInfo.Name) + '-dist.' + WatcherControl.FileTypesProcessedExt[Ext]
      return FileInfo
    @FileRelative:(Path1, Path2)->
      Path1 = Path1.split Path.sep
      Path2 = Path2.split Path.sep

      RelativePath = []

      while Path1.length and Path2.length and Path1[0] == Path2[0]
        Path1.splice Path1[0], 1
        Path2.splice Path2[0], 1
      I = 0
      while I < Path1.length
        RelativePath.push '..'
        ++I
      return RelativePath.join(Path.sep) + Path.sep + Path2.join(Path.sep) if RelativePath.length
      return Path2.join(Path.sep);
    @FileRead:(FilePath)->
      return new Promise (Resolve,Reject)->
        FS.readFile FilePath, (Error, Contents)->
          if Error
            Reject Error
          else
            Resolve Contents.toString()
    @FileExists:(FilePath)->
      return new Promise (Resolve,Reject)->
        FS.exists FilePath, (Status)->
          if Status
            Resolve()
          else
            Reject()
    @ABSPath:(FilePath, FileDir)->
      if FilePath.substr(0,1) isnt Path.sep and FilePath.substr(1,1) isnt ':'
        FilePath = FileDir + Path.sep + FilePath
      FilePath
    @Manifest:(Dir)->
      return new Promise (resolve)->
        H.ScanDir(Dir).then (Items)->
          resolve Name: Path.basename(Dir), Items: Items, Version: WatcherControl.Version
    @Merge:(ToReturn)->
      ToReturn = ToReturn || {}
      Array.prototype.slice.call(arguments,1).forEach (Argument)->
        for Key,Value of Argument
          if Value isnt null and typeof Value is 'object'
            if Value.constructor.name is 'Array'
              ToReturn[Key] = ToReturn[Key] || [];
              ToReturn[Key].concat(Value)
            else
              ToReturn[Key] = ToReturn[Key] || {};
              H.Merge(ToReturn[Key], Value);
          else
            ToReturn[Key] = Value
      ToReturn
    @Each:(object,callback)->
      return unless object
      try
        if typeof object isnt 'function' and typeof object.length isnt 'undefined'
          Array.prototype.forEach.call object, (I,II)->
            if callback.call(I,I,II) is false then throw null
        else
          for i in object when object.hasOwnProperty(i)
            if callback.call(object[i],object[i],i) is false then throw null
    @ScanDir: (Directory, RelativePath = '', Excluded = [])->
      return new Promise (Resolve)->
        ToReturn = Info: {}, Tree: Dirs:{},Files:[]
        FS.readdir Directory, (_, Contents)->
          Promises = []
          Contents.forEach (Entry)->
            FullPath = Directory + Path.sep + Entry
            return unless H.ExcludedFiles.indexOf(Entry) is -1 and Excluded.indexOf(FullPath) is -1
            Promises.push new Promise (ResolveFile)->
              FS.stat FullPath, (_, Stats)->
                if Stats.isDirectory()
                  NewRelativePath = RelativePath + (if RelativePath is '' then '' else '/')
                  H.ScanDir(FullPath, NewRelativePath + Entry).then (Results)->
                    for FilePath,Item of Results.Info
                      ToReturn.Info[FilePath] = Item
                    ToReturn.Tree.Dirs[Entry] = Results.Tree
                    ResolveFile()
                else
                  ToReturn.Tree.Files.push Entry
                  FileInfo = H.FileInfo FullPath,RelativePath,Entry
                  ToReturn.Info[FileInfo.Path] = FileInfo if FileInfo
                  ResolveFile()
          Promise.all(Promises).then ->
            Resolve ToReturn