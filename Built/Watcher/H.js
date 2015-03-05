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

      H.ExcludedFiles = ['.git', '.idea', 'Built', 'Build', 'build', 'built', 'node_modules'];

      H.FileDir = function(FilePath) {
        FilePath = FilePath.split(Path.sep);
        FilePath.pop();
        return FilePath.join(Path.sep);
      };

      H.FileName = function(Basename) {
        Basename = Basename.split('.');
        Basename.pop();
        return Basename;
      };

      H.FileInfo = function(FullPath, RelativePath, Name) {
        var Ext, FileInfo, NameChunks;
        NameChunks = Name.split('.');
        Ext = NameChunks.pop().toUpperCase();
        if (!WatcherControl.FileTypes.hasOwnProperty(Ext)) {
          return;
        }
        FileInfo = {
          Path: RelativePath + Path.sep + Name,
          Name: Name,
          Ext: Ext,
          Config: H.Merge({}, WatcherControl.FileTypes[Ext]),
          Type: WatcherControl.FileTypesProcessedExt[Ext].toUpperCase()
        };
        FileInfo.Config.Output = RelativePath + Path.sep + H.FileName(FileInfo.Name) + '-dist.' + WatcherControl.FileTypesProcessedExt[Ext];
        return FileInfo;
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

      H.Merge = function(ToReturn) {
        ToReturn = ToReturn || {};
        Array.prototype.slice.call(arguments, 1).forEach(function(Argument) {
          var Key, Value, i, len, results;
          results = [];
          for (Value = i = 0, len = Argument.length; i < len; Value = ++i) {
            Key = Argument[Value];
            if (Argument.hasOwnProperty(Key)) {
              if (Value !== null && typeof Value === 'object') {
                if (Value.constructor.name === 'Array') {
                  ToReturn[Key] = ToReturn[Key] || [];
                  results.push(ToReturn[Key].concat(Value));
                } else {
                  ToReturn[Key] = ToReturn[Key] || {};
                  results.push(H.Merge(ToReturn[Key], Value));
                }
              } else {
                results.push(ToReturn[Key] = Value);
              }
            }
          }
          return results;
        });
        return ToReturn;
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
                  var FileInfo, NewRelativePath;
                  if (Stats.isDirectory()) {
                    NewRelativePath = RelativePath + (RelativePath === '' ? '' : '/');
                    return H.ScanDir(FullPath, NewRelativePath + Entry).then(function(Results) {
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
