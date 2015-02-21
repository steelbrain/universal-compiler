Universal-Compiler
=================
Universal compiler is a compiler for your Web Assets, Period.

#### Installation
```
npm install universal-compiler
```
#### Languages Supported
 - CSS (Minification)
 - LESS
 - CoffeeScript
 - Javascript (ES6 & Minification)

#### Usage
```
cd universal-compiler/Build/

Syntax:
./Compiler-Exec.js Source [Target] [SourceMapTarget]

-- Javascript
// Compiling /tmp/1.js into /tmp/2.js
./Compiler-Exec.js /tmp/1.js /tmp/2.js
// Generating a SourceMap at 2.map
./Compiler-Exec.js /tmp/1.js /tmp/2.js /tmp/2.map
-- LESS
// Compiling /tmp/1.less into /tmp/2.css
./Compiler-Exec.js /tmp/1.less /tmp/2.css
// Generating a SourceMap at 2.map
./Compiler-Exec.js /tmp/1.less /tmp/2.css /tmp/2.map
```

If the target isn't provided as a CLI argument the compiler will output the compiled file.
What's my favorite thing about this compiler is that you can actually control the options from the files themselves.

```js
// Note: I am 1.js
// @Compiler-Output "2.js"
// @Compiler-Sourcemap "2.map"
window.a = function(){
  console.log("Aa am A Yo!");
}
```
Now running `./Compiler-Exec.js 1.js` will automatically save the file in the path specified in that file.

#### License
 Le GPL ;)
