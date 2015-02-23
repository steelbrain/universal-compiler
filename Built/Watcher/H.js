(function() {
  var Compiler, FS, H, Path, Promise;

  FS = require('fs');

  Path = require('path');

  Promise = require('a-promise');

  Compiler = require('../Compiler/Compiler').Compiler;

  H = (function() {
    function H() {}

    H.ExcludedFiles = ['.git'];

    H.FileInfo = function(LePath, Name) {
      var Ext;
      Ext = Name.split('.').pop();
      if (!Compiler.Map.hasOwnProperty(Ext)) {
        return;
      }
      return {
        Path: LePath,
        Name: Name,
        Ext: Ext,
        Config: {}
      };
    };

    H.ScanDir = function(LePath) {
      return new Promise(function(resolve) {
        return FS.readdir(LePath, function(_, Files) {
          var Remaining, ToReturn;
          ToReturn = {
            Folders: [],
            Files: [],
            Excluded: []
          };
          Remaining = [];
          return Files.forEach(function(File) {
            var FilePath;
            if (H.ExcludedFiles.indexOf(File) !== -1) {
              return;
            }
            FilePath = LePath + Path.sep + File;
            Remaining.push(FilePath);
            return FS.stat(FilePath, function(_, Stat) {
              var LeFile;
              if (Stat.isDirectory()) {
                return H.ScanDir(FilePath).then(function(Results) {
                  ToReturn.Folders.push({
                    Name: File,
                    Path: FilePath,
                    Entries: Results
                  });
                  Remaining.splice(Remaining.indexOf(FilePath), 1);
                  if (!Remaining.length) {
                    return resolve(ToReturn);
                  }
                });
              } else {
                LeFile = H.FileInfo(FilePath, File);
                if (LeFile) {
                  ToReturn.Files.push(LeFile);
                }
                Remaining.splice(Remaining.indexOf(FilePath), 1);
                if (!Remaining.length) {
                  return resolve(ToReturn);
                }
              }
            });
          });
        });
      });
    };

    return H;

  })();

  module.exports = H;

}).call(this);
