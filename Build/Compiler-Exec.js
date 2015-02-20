#!/usr/bin/env nodejs
"use strict";




var Compiler = require("./Compiler");
if (!process.argv[2] || process.argv[2].indexOf('node_modules') !== -1) {
  console.log("Please Specify a source File");
  process.exit(1);
}
Compiler = new Compiler();
Compiler.Compile(process.argv[2], process.argv[3], process.argv[4]).then(function (Result) {
  if (!process.argv[3] && Result) {
    process.stdout.write(Result.Content);
  }
}, function (Error) {
  console.log(Error.toString());
  process.exit(1);
});
