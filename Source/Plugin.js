"use strict"
let DuplexStream = require('stream').Duplex
class UniVocPlugin {
  static Process(FilePath, Opts, Buffer){
    return new Promise(function(Resolve){
      Resolve(Buffer)
    })
  }
  static Stream(FilePath, Opts){
    let Stream = DuplexStream()
    let Buffers = []
    let Deferred = Promise.defer()
    Stream._read = function(){
      Deferred.promise.then(function(){
        return UniVocPlugin.Process(FilePath, Opts, (new Buffer).concat(Buffers))
      })
    }
    Stream._write = function(Chunk, Encoding){
      Buffers.push(Chunk)
      if(Chunk === null) Deferred.resolve()
    }
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