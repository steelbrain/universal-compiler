var
  Compiler = require('./Compiler');
if(!process.argv[2]){
  console.log("Please Specify a source File");
  process.exit(1);
}
Compiler = new Compiler();
Compiler.Compile(process.argv[2],process.argv[3],process.argv[4]).then(function(Result){
  console.log(Result);
}).catch(function(Error){
  console.log(Error.toString());
  console.log(Error.stack);
  process.exit(1);
});