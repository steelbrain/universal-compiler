(function() {
  var Compiler, FS, Path, Promise;

  FS = require('fs');

  Path = require('path');

  Promise = require('a-promise');

  Compiler = require('../Compiler/Compiler').Compiler;

  module.exports = function(WatcherControl) {
    var H;
    return H = (function() {
      function H() {}

      H.ExcludedFiles = ['.git', '.idea'];

      H.FileDir = function(FilePath) {
        FilePath = FilePath.split(Path.sep);
        FilePath.pop();
        return FilePath.join(Path.sep);
      };

      H.FileInfo = function(FullPath, RelativePath, Name) {
        var Ext, NameChunks, ToReturn;
        NameChunks = Name.split('.');
        Ext = NameChunks.pop().toUpperCase();
        if (!WatcherControl.FileTypes.hasOwnProperty(Ext)) {
          return;
        }
        ToReturn = {
          Path: RelativePath + '/' + Name,
          Name: Name,
          Ext: Ext,
          Config: WatcherControl.FileTypes[Ext],
          Type: WatcherControl.FileTypesProcessedExt[Ext].toUpperCase()
        };
        ToReturn.Config.Output = RelativePath + '/' + NameChunks.join('.') + '-dist.' + WatcherControl.FileTypesProcessedExt[Ext];
        return ToReturn;
      };

      H.Manifest = function(Dir) {
        return new Promise(function(resolve) {
          return H.ScanDir(Dir).then(function(Items) {
            return resolve({
              Name: Path.basename(Dir),
              Items: Items,
              Version: WatcherControl.Version
            });
          });
        });
      };

      H.ScanDir = function(Directory, RelativePath, Excluded) {
        if (RelativePath == null) {
          RelativePath = '';
        }
        if (Excluded == null) {
          Excluded = [];
        }
        return new Promise(function(Resolve) {
          var ToReturn;
          ToReturn = {
            Info: {},
            Tree: {
              Dirs: {},
              Files: []
            }
          };
          return FS.readdir(Directory, function(_, Contents) {
            var Promises;
            Promises = [];
            Contents.forEach(function(Entry) {
              var FullPath;
              FullPath = Directory + Path.sep + Entry;
              if (!(H.ExcludedFiles.indexOf(Entry) === -1 && Excluded.indexOf(FullPath) === -1)) {
                return;
              }
              return Promises.push(new Promise(function(ResolveFile) {
                return FS.stat(FullPath, function(_, Stats) {
                  var FileInfo;
                  if (Stats.isDirectory()) {
                    if (RelativePath !== '') {
                      RelativePath += '/';
                    }
                    return H.ScanDir(FullPath, RelativePath + Entry).then(function(Results) {
                      var FilePath, Item, ref;
                      ref = Results.Info;
                      for (FilePath in ref) {
                        Item = ref[FilePath];
                        ToReturn.Info[FilePath] = Item;
                      }
                      ToReturn.Tree.Dirs[Entry] = Results.Tree;
                      return ResolveFile();
                    });
                  } else {
                    ToReturn.Tree.Files.push(Entry);
                    FileInfo = H.FileInfo(FullPath, RelativePath, Entry);
                    if (FileInfo) {
                      ToReturn.Info[FileInfo.Path] = FileInfo;
                    }
                    return ResolveFile();
                  }
                });
              }));
            });
            return Promise.all(Promises).then(function() {
              return Resolve(ToReturn);
            });
          });
        });
      };

      return H;

    })();
  };

}).call(this);
