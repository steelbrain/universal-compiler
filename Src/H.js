

// @Compiler-Output "../Build/H.js"
var Path = require('path');
class H{
  static Relative(Path1:String, Path2:String):String{
    Path1 = Path1.split(Path.sep);
    Path2 = Path2.split(Path.sep);

    var RelativePath = [], I = null;
    while(Path1.length && Path2.length && (Path1[0] === Path2[0])){
      Path1.splice(Path1[0],1);
      Path2.splice(Path2[0],1);
    }
    for(I = 0; I < Path1.length; ++I) RelativePath.push('..');
    return RelativePath.length ?
      RelativePath.join(Path.sep) + Path.sep + Path2.join(Path.sep) :
      Path2.join(Path.sep);
  }
  static Clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }
}
module.exports = H;