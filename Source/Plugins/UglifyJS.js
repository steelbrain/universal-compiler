"use strict"
let Base = require('../Plugin')
let UglifyJS
let Path = require('path')
class UniVocUglifyJS extends Base{
  static Process(UniVoc, Opts, Buffer){
    Buffer = Buffer.toString("utf8")
    if(!Opts.Compress){
      return Promise.resolve(Buffer)
    }
    UglifyJS = UglifyJS || require('uglify-js')
    return Promise.resolve(UglifyJS.minify(Buffer, {fromString: true}).code)
  }
}
UniVocUglifyJS.Name = 'UglifyJS'
UniVocUglifyJS.Ext = 'js'
module.exports = UniVocUglifyJS