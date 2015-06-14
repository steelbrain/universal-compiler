"use strict"
let TransformStream = require('stream').Transform
class UniVocPlugin {
  static Process(FilePath, Opts, Buffer){
    return new Promise(function(Resolve){
      Resolve(Buffer)
    })
  }
  static Stream(FilePath, Opts){
    let Stream = new TransformStream({objectMode: true})
    let Me = this
    Stream._transform = function(Chunk, _, Callback){
      Me.Process(FilePath, Opts, Chunk).then(function(Output){
        Stream.push(Output)
        Callback()
      })
    }
    return Stream
  }
  static Register(UniVoc){
    if(!UniVoc.Plugins.has(this.Ext)){
      UniVoc.Plugins.set(this.Ext, new Map())
    }
    UniVoc.Plugins.get(this.Ext).set(this.Name, this)
  }
}
UniVocPlugin.Name = 'Base'
UniVocPlugin.Comments = '//'
UniVocPlugin.Ext = ''
UniVocPlugin.Options = {}
module.exports = UniVocPlugin