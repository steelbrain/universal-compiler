"use strict"
let Base = require('../Plugin')
class UniVocJS extends Base{
  static Process(UniVoc, Opts, Buffer){
    Buffer = Buffer.toString("utf8")
    return this.ScanOptions(Opts, Buffer).then(function(Buffer){
      return Buffer
    })
  }
}
UniVocJS.Tags.set('Compiler-Compress', function(Name, Value, _, Opts){
  Opts.Compress = Value === 'true'
})
UniVocJS.Tags.set('Compiler-Transpile', function(Name, Value, _, Opts){
  Opts.Transpile = Value === 'true'
})
UniVocJS.Name = 'JS'
UniVocJS.Ext = ['js', 'jsx', 'tag']
module.exports = UniVocJS