#!/usr/bin/env nodejs

var
  Compiler = require('../Built/Compiler/Compiler').Compiler;
if(!process.argv[2]){
  console.log("Please Specify a source File");
  process.exit(1);
}
Compiler.Compile(process.argv[2],{Write:true}).then(function(Result){
  if(!process.argv[2] && Result){
    process.stdout.write(Result.Content);
  }
},function(Error){
  console.log(Error.toString());
  process.exit(1);
});
