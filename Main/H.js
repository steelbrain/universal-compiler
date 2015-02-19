
var Path = require('path');
class H{
  static Relative(Path1:String, Path2:String):String{
    Path1 = Path1.split(Path.sep);
    Path2 = Path2.split(Path.sep);
    if(Path1.slice(0,Path1.length-1).join(Path.sep) === Path2.slice(0,Path2.length-1).join(Path.sep)){
      return Path1.slice(0,Path1.length-1).join(Path.sep);
    }
    var
      Path1Reverse = Path1.slice().reverse(),
      Path2Reverse = Path2.slice().reverse();

    console.log(Path1)
    console.log(Path2)
    console.log(Path1Reverse)
    console.log(Path2Reverse)
    process.exit();
  }
}
module.exports = H;