(function() {
  var FS, Path, Promise;

  Path = require('path');

  Promise = require('a-promise');

  FS = require('fs');

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
        if (RelativePath !== '') {
          RelativePath = RelativePath + Path.sep;
        }
        FileInfo = {
          Path: RelativePath + Name,
          Name: Name,
          Ext: Ext,
          Config: H.Merge({}, WatcherControl.FileTypes[Ext]),
          Type: WatcherControl.FileTypesProcessedExt[Ext].toUpperCase()
        };
        FileInfo.Config.Output = RelativePath + H.FileName(FileInfo.Name) + '-dist.' + WatcherControl.FileTypesProcessedExt[Ext];
        return FileInfo;
      };

      H.FileRelative = function(Path1, Path2) {
        var I, RelativePath;
        Path1 = Path1.split(Path.sep);
        Path2 = Path2.split(Path.sep);
        RelativePath = [];
        while (Path1.length && Path2.length && Path1[0] === Path2[0]) {
          Path1.splice(Path1[0], 1);
          Path2.splice(Path2[0], 1);
        }
        I = 0;
        while (I < Path1.length) {
          RelativePath.push('..');
          ++I;
        }
        if (RelativePath.length) {
          return RelativePath.join(Path.sep) + Path.sep + Path2.join(Path.sep);
        }
        return Path2.join(Path.sep);
      };

      H.FileRead = function(FilePath) {
        return new Promise(function(Resolve, Reject) {
          return FS.readFile(FilePath, function(Error, Contents) {
            if (Error) {
              return Reject(Error);
            } else {
              return Resolve(Contents.toString());
            }
          });
        });
      };

      H.FileExists = function(FilePath) {
        return new Promise(function(Resolve, Reject) {
          return FS.exists(FilePath, function(Status) {
            if (Status) {
              return Resolve();
            } else {
              return Reject();
            }
          });
        });
      };

      H.ABSPath = function(FilePath, FileDir) {
        if (FilePath.substr(0, 1) !== Path.sep && FilePath.substr(1, 1) !== ':') {
          FilePath = FileDir + Path.sep + FilePath;
        }
        return FilePath;
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
          var Key, Value, results;
          results = [];
          for (Key in Argument) {
            Value = Argument[Key];
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
          return results;
        });
        return ToReturn;
      };

      H.Each = function(object, callback) {
        var i, j, len, results;
        if (!object) {
          return;
        }
        try {
          if (typeof object !== 'function' && typeof object.length !== 'undefined') {
            return Array.prototype.forEach.call(object, function(I, II) {
              if (callback.call(I, I, II) === false) {
                throw null;
              }
            });
          } else {
            results = [];
            for (j = 0, len = object.length; j < len; j++) {
              i = object[j];
              if (object.hasOwnProperty(i)) {
                if (callback.call(object[i], object[i], i) === false) {
                  throw null;
                } else {
                  results.push(void 0);
                }
              }
            }
            return results;
          }
        } catch (_error) {}
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
