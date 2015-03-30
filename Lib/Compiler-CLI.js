#!/usr/bin/env iojs


"use strict";
var
  Compiler = require('../Compiler'),
  Opts = require('minimist')(process.argv.slice(2)),
  Log = require('debug'),
  FS = require('fs'),
  CLI = require('./CLI/Compiler')(Opts, FS, Log, Compiler);
Log.enable('uc-compiler-cli');
Log = Log('uc-compiler-cli');
try {
  CLI.Init();
} catch(error){
  Log(error.message);
}