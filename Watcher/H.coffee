

# @Compiler-Output "../Built/Watcher/H.js"
FS = require 'fs'
Path = require 'path'
Promise = require 'a-promise'
{Compiler} = require '../Compiler/Compiler'
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
      FileInfo =
        Path: RelativePath + Path.sep + Name,
        Name:Name,
        Ext:Ext,
        Config: H.Merge({},WatcherControl.FileTypes[Ext]),
        Type: WatcherControl.FileTypesProcessedExt[Ext].toUpperCase()
      FileInfo.Config.Output = RelativePath + Path.sep + H.FileName(FileInfo.Name) + '-dist.' + WatcherControl.FileTypesProcessedExt[Ext]
      return FileInfo
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