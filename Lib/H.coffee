
Path = require('path')
class H
  @Merge:(ToReturn)->
    ToReturn = ToReturn || {}
    Array.prototype.slice.call(arguments,1).forEach (Argument)->
      for Key,Value of Argument
        if Value isnt null and typeof Value is 'object'
          if Value.constructor.name is 'Array'
            ToReturn[Key] = ToReturn[Key] || [];
            ToReturn[Key].concat(Value)
          else
            ToReturn[Key] = ToReturn[Key] || {};
            H.Merge(ToReturn[Key], Value);
        else
          ToReturn[Key] = Value
    return ToReturn
  @ABSPath:(FilePath, FileDir)->
    if FilePath.substr(0,1) isnt Path.sep and FilePath.substr(1,1) isnt ':'
      FilePath = FileDir + Path.sep + FilePath
    FilePath
  @FileRelative:(Path1, Path2)->
    Path1 = Path1.split Path.sep
    Path2 = Path2.split Path.sep

    RelativePath = []

    while Path1.length and Path2.length and Path1[0] == Path2[0]
      Path1.splice Path1[0], 1
      Path2.splice Path2[0], 1
    I = 0
    while I < Path1.length
      RelativePath.push '..'
      ++I
    return RelativePath.join(Path.sep) + Path.sep + Path2.join(Path.sep) if RelativePath.length
    return Path2.join(Path.sep);
module.exports = H