#!/usr/bin/env iojs


"use strict";
var
  Watcher = require('../Watcher'),
  Opts = require('minimist')(process.argv.slice(2)),
  Log = require('debug'),
  FS = require('fs'),
  CLI = require('./CLI/Watcher')(Opts, Watcher, FS, Log);
Log.enable('uc-watcher-cli');
Log = Log('uc-watcher-cli');

try {
  CLI.Init();
} catch(error){
  Log(error.message);
}