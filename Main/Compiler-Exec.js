var
  Compiler = require('./Compiler');
if(!process.argv[2]){
  console.log("Please Specify a source File");
  process.exit(1);
}
try {
  Compiler = new Compiler;
  Compiler.Compile(process.argv[2],process.argv[3],process.argv[4]);
} catch(LeError){
  console.log(LeError.toString());
  process.exit(1);
}