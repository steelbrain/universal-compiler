"use strict"
let Base = require('../Plugin')
let Babel
let Path = require('path')
class UniVocBabel extends Base{
  static Process(UniVoc, Opts, Buffer){
    Buffer = Buffer.toString("utf8")
    if(!Opts.Transpile){
      return Promise.resolve(Buffer)
    }
    Babel = Babel || require('babel')
    return Promise.resolve(Babel.transform(Buffer, {
      sourceRoot: Path.dirname(Opts.Path),
      filename: Path.basename(Opts.path)
    }).code)
  }
}
UniVocBabel.Name = 'Babel'
UniVocBabel.Ext = ['js', 'jsx', 'tag']
module.exports = UniVocBabel