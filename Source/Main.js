"use strict"
let FS = require('fs')
let Helpers = require('./Helpers')
class UniVoc{
  static ProcessFile(Path){
    let Ext = Path.split('.')
    let Opts = {Output: null}
    Ext = Ext[ Ext.length - 1 ]
    return new Promise(function(Resolve){
      if(!UniVoc.Plugins.has(Ext)){
        throw new Error(`Provided filetype '${Ext}' isn't recognized`)
      }
      FS.access(Path, FS.R_OK, Resolve)
    }).then(function(Access){
        if(Access !== null) throw Access
        let Stream = FS.createReadStream(Path)
        for(let Plugin of UniVoc.Plugins.get(Ext)){
          Stream = Stream.pipe(Plugin[1].Stream(Path, Opts))
        }
        return Stream
      })
  }
}
UniVoc.Plugins = new Map
require('./Plugins/JS').Register(UniVoc)
UniVoc.ProcessFile("/var/web/PublishSpace/dQuery/Source/Compile.js").then(function(Stream){
  Stream.pipe(FS.createWriteStream("/tmp/test"))
  console.log(`Promise Result`)
}, function(e){
  console.log(e.stack)
})