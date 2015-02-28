

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
  static Clone(Obj) {
    var Key, New, Value;
    if (!(Obj !== null && typeof Obj === 'object')) {
      return Obj;
    }
    New = Obj.constructor();
    for (Key in Obj){
      if(Obj.hasOwnProperty(Key)){
        Value = Obj[Key];
        if (typeof Value === 'object') {
          New[Key] = H.Clone(Value);
        } else {
          New[Key] = Value;
        }
      }
    }
    return New;
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
  static Each(object,callback){
    var i, ret;
    if(!object) return ;
    try{
      if(typeof object.length !== 'undefined' && typeof object !== 'function'){
        if(typeof object.elements !== 'undefined'){
          object = object.elements;
        }
        Array.prototype.forEach.call(object,function(element,index,array){
          if(callback.call(element,element,index,array) === false)
            throw null;
        });
      } else {
        for(i in object){
          if(object.hasOwnProperty(i)){
            if(callback.call(object[i],object[i],i,object) === false)
              break;
          }
        }
      }
    } catch(e){}
  }
  static Extend(Out){
    Out = Out || {};
    H.Each(Array.prototype.slice.call(arguments,1),function(obj){
      H.Each(obj,function(val,key){
        if(typeof val === 'object' && val !== null){
          Out[key] = Out[key] || {};
          H.Extend(Out[key],val);
        } else {
          Out[key] = val;
        }
      });
    });
    return Out;
  }
}
module.exports = H;