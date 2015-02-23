

// @Compiler-Output "../Built/Compiler/H.js"
var
  Path = require('path'),
  FS = require('fs');
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
  static ABSPath(FilePath:String, FileDir:String):String{
    if (FilePath.substr(0, 1) !== Path.sep &&
      FilePath.substr(1, 1) !== ':') { // Windows Drive `D:\`
      FilePath = FileDir + Path.sep + FilePath;
    }
    return FilePath;
  }
  static FileDir(FilePath:String):String{
    FilePath = FilePath.split(Path.sep);
    FilePath.pop();
    return FilePath.join(Path.sep);
  }
  static FileRead(FilePath:String):Promise{
    return new Promise(function(Resolve,Reject){
      FS.readFile(FilePath,function(Error,Content){
        if(Error){
          Reject(Error);
        } else {
          Resolve(Content.toString());
        }
      });
    });
  }
  static FileExists(FilePath:String):Promise{
    return new Promise(function(Resolve,Reject){
      FS.exists(FilePath,function(Status){
        if(Status){
          Resolve();
        } else {
          Reject();
        }
      });
    });
  }
}
module.exports = H;