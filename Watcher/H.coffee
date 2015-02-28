

# @Compiler-Output "../Built/Watcher/H.js"
FS = require 'fs'
Path = require 'path'
Promise = require 'a-promise'
{Compiler} = require '../Compiler/Compiler'
module.exports = (WatcherControl)->
  class H
    @ExcludedFiles = ['.git']
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
      Ext = Name.split('.').pop().toUpperCase()
      return unless WatcherControl.FileTypes.hasOwnProperty Ext
      return Path: FullPath, Name:Name, Ext:Ext, Config: WatcherControl.FileTypes[Ext]
    @Manifest:(Dir)->
      return new Promise (resolve)->
        H.ScanDir(Dir).then (Items)->
          resolve Name: Path.basename(Dir), Items: Items, Version: WatcherControl.Version
    @ScanDir: (Directory, Excluded = [])->
      return new Promise (Resolve)->
        ToReturn = Info: [], Tree: Dirs:{},Files:[]
        FS.readdir Directory, (_, Contents)->
          Promises = []
          Contents.forEach (Entry)->
            FullPath = Directory + Path.sep + Entry
            return unless H.ExcludedFiles.indexOf(Entry) is -1 and Excluded.indexOf(FullPath) is -1
            Promises.push new Promise (ResolveFile)->
              FS.stat FullPath, (_, Stats)->
                if Stats.isDirectory()
                  H.ScanDir(FullPath).then (Results)->
                    Results.Info.forEach (Item)-> ToReturn.Info.push(Item)
                    ToReturn.Tree.Dirs[Entry] = Results.Tree
                    ResolveFile()
                else
                  ToReturn.Tree.Files.push Entry
                  ToReturn.Info.push H.FileInfo FullPath,Entry
                  ResolveFile()
          Promise.all(Promises).then ->
            Resolve ToReturn