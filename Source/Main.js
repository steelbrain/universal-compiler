"use strict"
let FS = require('fs')
class UniVoc{
  static CompileFile(Path){
    return new Promise(function(Resolve){
      let Ext = Path.split('.')
      Ext = Ext[ Ext.length - 1 ]
      if(!this.Plugins.has(Ext)){
        throw new Error(`Provided filetype '${Ext}' isn't recognized`)
      }
      Resolve(FS.access(Path))
    })
  }
}
UniVoc.Plugins = new Map
require('./Plugins/JS').Register(UniVoc)
UniVoc.CompileFile("/var/web/PublishSpace/dQuery/Source/Compile.js").then(function(Result){
  console.log(`Promise Result`)
})