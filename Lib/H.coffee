

# @Compiler-Output "H.js"
Path = require('path')
FS = require('fs')
Minimatch = require('minimatch')
class H
  @DefaultExcluded:['.git', '.idea', 'Build', 'build', 'built', 'Built', 'node_modules']
  @Version:'0.0.2'
  @ProcessedMap:{
    'JS': 'js',
    'COFFEE': 'js',
    'JSX': 'js',
    'TAG': 'js',
    'CSS': 'css',
    'LESS': 'css',
    'SCSS': 'css',
    'SASS': 'css'
  }
  @Merge:(ToReturn)->
    ToReturn = ToReturn || {}
    Array.prototype.slice.call(arguments,1).forEach (Argument)->
      for Key,Value of Argument
        if Value isnt null and typeof Value is 'object'
          if Value.constructor.name is 'Array'
            ToReturn[Key] = ToReturn[Key] || [];
            ToReturn[Key].concat(Value)
          else
            ToReturn[Key] = ToReturn[Key] || {};
            H.Merge(ToReturn[Key], Value);
        else
          ToReturn[Key] = Value
    return ToReturn
  @ABSPath:(FilePath, FileDir)->
    if FilePath.substr(0,1) isnt Path.sep and FilePath.substr(1,1) isnt ':'
      FilePath = FileDir + Path.sep + FilePath
    FilePath
  @FileRelative:(Path1, Path2)->
    Path1 = Path1.split Path.sep
    Path2 = Path2.split Path.sep

    RelativePath = []

    while Path1.length and Path2.length and Path1[0] == Path2[0]
      Path1.splice Path1[0], 1
      Path2.splice Path2[0], 1
    I = 0
    while I < Path1.length
      RelativePath.push '..'
      ++I
    return RelativePath.join(Path.sep) + Path.sep + Path2.join(Path.sep) if RelativePath.length
    return Path2.join(Path.sep);
  @Manifest:(Dir, Excluded = [])->
    return new Promise (Resolve, Reject)->
      ToReturn = Name: Path.basename(Dir), Version: H.Version, Excluded: H.DefaultExcluded.concat(Excluded)
      H.ScanDir(Dir, '', ToReturn.Excluded).then (Items)->
        ToReturn.Items = Items;
        Resolve(ToReturn)
      .catch(Reject)
  @FileInfo:(FullPath, EntryPath, Name)->
    NameChunks = Name.split('.')
    Ext = NameChunks.pop().toUpperCase()
    return unless UniversalCompiler.Plugins.has Ext
    FileInfo =
      Path: EntryPath,
      Name: Name,
      Config: H.Merge({}, UniversalCompiler.Plugins.get(Ext).DefaultOpts, {Watch:false}),
      Type: Ext
    FilePathWithoutExt = EntryPath.split('.')
    FilePathWithoutExt.pop()
    FileInfo.Config.Output = FilePathWithoutExt.join('.') + '-dist.' + H.ProcessedMap[Ext]
    return FileInfo
  @NormalizeOpts:(Opts)->
    for Key in Opts when Opts.hasOwnProperty(Key)
      if Opts[Key] is 'true' then Opts[Key] = true
      else if Opts[Key] is 'false' then Opts[Key] = false
  @FileExcluded:(FileName, FilePath,Excluded = [])->
    ToReturn = false
    Excluded.forEach (Entry)->
      return if ToReturn
      ToReturn = Minimatch(FileName, Entry) || Minimatch(FilePath, Entry)
    return ToReturn
  @ScanDir: (Directory, RelativePath = '', Excluded = [])->
    return new Promise (Resolve)->
      ToReturn = Info: {}, Tree: Dirs:{},Files:[]
      FS.readdir Directory, (_, Contents)->
        Promises = []
        Contents.forEach (Entry)->
          FullPath = Directory + '/' + Entry
          EntryPath = (if RelativePath is '' then RelativePath else RelativePath + Path.sep) + Entry
          return if H.FileExcluded(Entry, EntryPath, Excluded)
          Promises.push new Promise (ResolveFile)->
            FS.stat FullPath, (_, Stats)->
              if Stats.isDirectory()
                NewRelativePath = RelativePath + (if RelativePath is '' then '' else '/')
                H.ScanDir(FullPath, NewRelativePath + Entry, Excluded).then (Results)->
                  for FilePath,Item of Results.Info
                    ToReturn.Info[FilePath] = Item
                  ToReturn.Tree.Dirs[Entry] = Results.Tree
                  ResolveFile()
              else
                ToReturn.Tree.Files.push Entry
                FileInfo = H.FileInfo FullPath,EntryPath,Entry
                ToReturn.Info[FileInfo.Path] = FileInfo if FileInfo
                ResolveFile()
        Promise.all(Promises).then ->
          Resolve ToReturn
module.exports = H