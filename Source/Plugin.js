"use strict"
let TransformStream = require('stream').Transform
let FS = require('fs')
let Path = require('path')
class UniVocPlugin {
  // An abstract method to be extended by plugins
  static Process(UniVoc, Opts, Buffer){
    return new Promise(function(Resolve){
      Resolve(Buffer)
    })
  }
  // Called by UniVoc in CompileFile
  static Stream(UniVoc, Opts){
    let Stream = new TransformStream({objectMode: true})
    let Me = this
    Stream._transform = function(Chunk, _, Callback){
      Me.Process(UniVoc, Opts, Chunk).then(function(Output){
        Stream.push(Output)
        Callback()
        Me = null
      })
    }
    return Stream
  }
  static ScanOptions(Opts, Buffer){
    let Me = this
    return new Promise(function(Resolve){
      let Regex = new RegExp(' *' + Me.Comments.replace('//', '\\/\\/') + ' @([\\w-]+) "(.+)"', 'g')
      let Result
      let Promises = []
      while((Result = Regex.exec(Buffer)) !== null){
        try {
          if(Me.Tags.has(Result[1])){
            Promises.push(Me.Tags.get(Result[1])(Result[1], Result[2], Buffer, Opts) || '')
          } else Promises.push(Result[0])
        } catch(Err){
          console.error(Err)
          Promises.push(Result[0])
        }
      }
      Resolve(Promise.all(Promises))
    }).then(function(Results){
        let Regex = new RegExp(' *' + Me.Comments.replace('//', '\\/\\/') + ' @([\\w-]+) "(.+)"', 'g')
        Buffer = Buffer.replace(Regex, function(){
          return Results.pop()
        })
        return Buffer
      })
  }
  static Register(UniVoc){
    if(!UniVoc.Plugins.has(this.Ext)){
      UniVoc.Plugins.set(this.Ext, new Map())
    }
    UniVoc.Plugins.get(this.Ext).set(this.Name, this)
  }
}
UniVocPlugin.Tags = new Map()
UniVocPlugin.Name = 'Base'
UniVocPlugin.Comments = '//'
UniVocPlugin.Ext = ''
UniVocPlugin.Options = {}
UniVocPlugin.Tags.set('Compiler-Output', function(Name, Value, Buffer, Opts){
  Opts.Output = Path.resolve(Path.dirname(Opts.Path), Value)
})
UniVocPlugin.Tags.set('Compiler-Include', function(Name, Value, Buffer, Opts){
  return new Promise(function(Resolve){
    FS.readFile(Path.resolve(Path.dirname(Opts.Path), Value), function(_, Contents){
      Resolve(Contents || '')
    })
  })
})
module.exports = UniVocPlugin