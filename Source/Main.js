"use strict"
let FS = require('fs')
let Path = require('path')
let Helpers = require('./Helpers')
class UniVoc{
  static ProcessFile(FilePath){
    let Ext = Path.extname(FilePath).substr(1)
    let Opts = {Output: null, Path: FilePath}
    return new Promise(function(Resolve){
      if(!UniVoc.Plugins.has(Ext)){
        throw new Error(`Provided filetype '${Ext}' isn't recognized`)
      }
      FS.access(FilePath, FS.R_OK, Resolve)
    }).then(function(Access){
        if(Access !== null) throw Access
        let Stream = FS.createReadStream(FilePath)
        for(let Plugin of UniVoc.Plugins.get(Ext)){
          Stream = Stream.pipe(Plugin[1].Stream(UniVoc, Opts))
        }
        return Stream
      })
  }
}
UniVoc.Plugins = new Map
UniVoc.H = Helpers
try {
  require('univoc-js').Register(UniVoc)
} catch(err){} // Fail silently if it's not installed
module.exports = UniVoc