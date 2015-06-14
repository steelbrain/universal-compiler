"use strict"
let TransformStream = require('stream').Transform
class UniVocPlugin {
  static Process(UniVoc, FilePath, Opts, Buffer){
    return new Promise(function(Resolve){
      Resolve(Buffer)
    })
  }
  // Called by UniVoc in CompileFile
  static Stream(UniVoc, FilePath, Opts){
    let Stream = new TransformStream({objectMode: true})
    let Me = this
    Stream._transform = function(Chunk, _, Callback){
      Me.Process(UniVoc, FilePath, Opts, Chunk).then(function(Output){
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
        if(Me.Tags.has(Result[1])){
          Promises.push(Me.Tags.get(Result[1])(Result[1], Result[2], Buffer, Opts) || '')
        } else Promises.push(Result[0])
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
  Opts.Output = Value
})
module.exports = UniVocPlugin