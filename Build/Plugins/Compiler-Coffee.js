"use strict";var _prototypeProperties=function(e,t,n){t&&Object.defineProperties(e,t),n&&Object.defineProperties(e.prototype,n)},_classCallCheck=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},Promise=require("a-promise"),UglifyJS=require("uglify-js"),CoffeeScript=null,FS=require("fs"),Path=require("path"),H=require("h"),CompilerCoffee=function(){function e(){_classCallCheck(this,e)}return e.RegexAppend=/@(codekit-append|prepros-append|Compiler-Append)/,e.RegexOutput=/@Compiler-Output/,e.RegexSourceMap=/@Compiler-Sourcemap/,e.RegexExtract=/".*"/,_prototypeProperties(e,{ExtractValue:{value:function(t){return new Promise(function(n,r){var o=e.RegexExtract.exec(t);return o.length?(o=o[0].substr(1,o[0].length-2),void n(o)):r()})},writable:!0,configurable:!0},ExtractPath:{value:function(t,n){return new Promise(function(r,o){e.ExtractValue(t).then(function(e){e.substr(0,1)!==Path.sep&&":"!==e.substr(1,1)&&(e=n+Path.sep+e),r(e)},o)})},writable:!0,configurable:!0},ParseAppend:{value:function(t,n,r){return new Promise(function(o,i){e.ExtractPath(t,n).then(function(e){FS.readFile(e,function(t,n){return t?i("The File '"+e+" doesn't exist, It was imported in "+r+"'"):void o(n.toString())})},i)})},writable:!0,configurable:!0},Parse:{value:function(t,n,r){return new Promise(function(o,i){var u={Contents:"",Opts:r},a=Path.dirname(t),c=[];n.forEach(function(o,i){var u;-1!==o.indexOf("#")&&c.push(new Promise(function(c,p){return o=o.trim(),u=o.indexOf("#"),-1===u||0!==u?c():void(e.RegexAppend.test(o)?e.ParseAppend(o,a,t).then(function(e){n[i]=e,c()},p):e.RegexOutput.test(o)?e.ExtractPath(o,a).then(function(e){r.TargetFile=e,c()},p):e.RegexSourceMap.test(o)?e.ExtractPath(o,a).then(function(e){r.SourceMap=""===e?null:e,c()}):c())}))}),Promise.all(c).then(function(){u.Contents=n.join("\n"),o(u)},i)})},writable:!0,configurable:!0},Process:{value:function(t,n){return new Promise(function(r,o){FS.readFile(t,function(i,u){return i?o(i):void e.Parse(t,u.toString().split("\n"),n).then(function(e){n=e.Opts;var t=null!==n.SourceMap,o={Content:"",SourceMap:"",Opts:n},i=null;CoffeeScript=CoffeeScript||require("coffee-script"),i=CoffeeScript.compile(o.Content,{sourceMap:!0}),o.Content=i.js,t&&(o.SourceMap=JSON.stringify(i.v3SourceMap)),n.SourceMap||"#!"===o.Content.substr(0,2)||(UglifyJS=UglifyJS||require("uglify-js"),i=UglifyJS.minify(o.Content||e.Content,{fromString:!0,outSourceMap:t?"js.map":void 0}),o.Content=i.code,t&&(o.SourceMap=i.map)),t&&(o.Content+="//# sourceMappingURL="+H.Relative(Path.dirname(n.TargetFile),n.SourceMap)),r(o)},o)})})},writable:!0,configurable:!0}}),e}();module.exports=CompilerCoffee;