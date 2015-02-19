

// @Compiler-Output "../Build/H.js"
var Path = require('path');
class H{
  static Relative(Path1:String, Path2:String):String{
    Path1 = Path1.split(Path.sep);
    Path2 = Path2.split(Path.sep);
    if(Path1.slice(0,Path1.length-1).join(Path.sep) === Path2.slice(0,Path2.length-1).join(Path.sep)){
      return Path1.slice(0,Path1.length-1).join(Path.sep);
    }

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
}
module.exports = H;