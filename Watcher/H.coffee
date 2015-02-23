

# @Compiler-Output "../Built/Watcher/H.js"
FS = require 'fs'
Path = require 'path'
Promise = require 'a-promise'
{Compiler} = require '../Compiler/Compiler'
{WatcherControl} = require './Watcher'
class H
  @ExcludedFiles = ['.git']
  @FileInfo:(LePath,Name)->
    Ext = Name.split('.').pop().toUpperCase()
    return unless WatcherControl.FileTypes.hasOwnProperty Ext
    return Path: LePath, Name:Name, Ext:Ext, Config: WatcherControl.FileTypes[Ext]
  @Manifest:(Dir)->
    return new Promise (resolve)->
      H.ScanDir(Dir).then (Items)->
        resolve Name: Path.basename(Dir), Items: Items
  @ScanDir:(LePath)->
    return new Promise (resolve)->
      FS.readdir LePath, (_,Files)->
        ToReturn = Folders:[], Files:[], Excluded:[]
        Remaining = []
        Files.forEach (File)->
          return unless H.ExcludedFiles.indexOf(File) is -1
          FilePath = LePath + Path.sep + File
          Remaining.push FilePath
          FS.stat FilePath, (_,Stat)->
            if Stat.isDirectory()
              H.ScanDir(FilePath).then (Results)->
                ToReturn.Folders.push Name: File, Path: FilePath, Entries: Results
                Remaining.splice(Remaining.indexOf(FilePath),1);
                resolve(ToReturn) unless Remaining.length
            else
              LeFile = H.FileInfo(FilePath, File);
              ToReturn.Files.push(LeFile) if LeFile
              Remaining.splice(Remaining.indexOf(FilePath),1);
              resolve(ToReturn) unless Remaining.length
module.exports = H