

# @Compiler-Output "../Built/Watcher/H.js"
FS = require 'fs'
Path = require 'path'
Promise = require 'a-promise'
{Compiler} = require '../Compiler/Compiler'
module.exports = (WatcherControl)->
  class H
    @ExcludedFiles = ['.git', '.idea']
    @FileDir:(FilePath)->
      FilePath = FilePath.split(Path.sep);
      FilePath.pop();
      return FilePath.join(Path.sep);
    @Clone:(Obj)->
      return Obj unless Obj isnt null and typeof Obj is 'object'
      New = Obj.constructor()
      for Key,Value of Obj when Obj.hasOwnProperty(Key)
        if typeof Value is 'object' and Value isnt null
          New[Key] = H.Clone Value
        else
          New[Key] = Value
      return New
    @FileInfo:(FullPath, Name)->
      NameChunks = Name.split('.')
      Ext = NameChunks.pop().toUpperCase()
      return unless WatcherControl.FileTypes.hasOwnProperty Ext
      ToReturn = Path: FullPath, Name:Name, Ext:Ext, Config: WatcherControl.FileTypes[Ext]
      ToReturn.Config.Output = H.FileDir(FullPath) + Path.sep + NameChunks.join('.') + '-dist.' + WatcherControl.FileTypesProcessedExt[Ext]
      return ToReturn
    @Manifest:(Dir)->
      return new Promise (resolve)->
        H.ScanDir(Dir).then (Items)->
          resolve Name: Path.basename(Dir), Items: Items, Version: WatcherControl.Version
    @ScanDir: (Directory, Excluded = [])->
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
                  H.ScanDir(FullPath).then (Results)->
                    for FilePath,Item of Results.Info
                      ToReturn.Info[FilePath] = Item
                    ToReturn.Tree.Dirs[Entry] = Results.Tree
                    ResolveFile()
                else
                  ToReturn.Tree.Files.push Entry
                  FileInfo = H.FileInfo FullPath,Entry
                  ToReturn.Info[FileInfo.Path] = FileInfo
                  ResolveFile()
          Promise.all(Promises).then ->
            Resolve ToReturn