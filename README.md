Universal-Compiler
=================
Universal-Compiler (aka UC-Compiler) is a Compiler / Minifier / Concatenator / Transpiler for *all* of your web assets.

#### Installation
```
sudo npm install -g universal-compiler
```

#### Usage
```
uc-compile Source [--Output OutputPath]
uc-watch Directory [--Excluded Dir1,Dir2]
```

##### UC-Compile
UC-Compile command compiles the provided file, If a second argument is provided, then it's used as the output location.
You can always override the options from within the files, for example
```js
// @Compiler-Output "2.js"
// @Compiler-Sourcemap "2.map"
// @Compiler-Transpile "true"
class A{
  constructor(){
    console.log("A::constructor")
  }
}
```
You can always specify these options as CLI arguments, for example, the command for the options above would be
`uc-compile A.js --Output 2.js --SourceMap 2.map --Transpile`

##### UC-Watch
UC-Watch command watches the directory specified and generates a manifest as `DeProc.json`, after this manifest is generated, You can edit it in an editor of your choice and set `"watch": true` for the files you want UC-Watch to watch changes for.

__Note:__ Make sure to restart uc-watch after you modify the manifest.

__Note:__ You can only exclude files when the manifest is generated, and it's only generated when a DeProc.json file is not present, so You might have to delete your manifest file and regenerate it.

#### Languages Supported
 - CSS
 - LESS
 - CoffeeScript
 - Javascript
 - SASS

#### License
 Le GPL ;)
