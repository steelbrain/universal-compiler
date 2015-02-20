"use strict";var _prototypeProperties=function(e,t,n){t&&Object.defineProperties(e,t),n&&Object.defineProperties(e.prototype,n)},_classCallCheck=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},Promise=require("a-promise"),UglifyJS=require("uglify-js"),CoffeeScript=null,FS=require("fs"),Path=require("path"),H=require("../H"),Compiler=null,CompilerCoffee=function(){function e(){_classCallCheck(this,e)}return e.RegexAppend=/@(codekit-append|prepros-append|Compiler-Append)/,e.RegexOutput=/@Compiler-Output/,e.RegexSourceMap=/@Compiler-Sourcemap/,e.RegexExtract=/".*"/,_prototypeProperties(e,{init:{value:function(e){Compiler=e},writable:!0,configurable:!0},ExtractValue:{value:function(t){return new Promise(function(n,r){var i=e.RegexExtract.exec(t);return i.length?(i=i[0].substr(1,i[0].length-2),void n(i)):r()})},writable:!0,configurable:!0},ExtractPath:{value:function(t,n){return new Promise(function(r,i){e.ExtractValue(t).then(function(e){e.substr(0,1)!==Path.sep&&":"!==e.substr(1,1)&&(e=n+Path.sep+e),r(e)},i)})},writable:!0,configurable:!0},ParseAppend:{value:function(t,n,r){return new Promise(function(i,o){e.ExtractPath(t,n).then(function(e){FS.readFile(e,function(t,n){return t?o("The File '"+e+" doesn't exist, It was imported in "+r+"'"):void i(n.toString())})},o)})},writable:!0,configurable:!0},Parse:{value:function(t,n,r){return new Promise(function(i,o){var u={Content:"",Opts:r},a=Path.dirname(t),c=[];n.forEach(function(i,o){var u;-1!==i.indexOf("#")&&c.push(new Promise(function(c,p){return i=i.trim(),u=i.indexOf("#"),-1===u||0!==u?c():void(e.RegexAppend.test(i)?e.ParseAppend(i,a,t).then(function(e){n[o]=e,c()},p):e.RegexOutput.test(i)?e.ExtractPath(i,a).then(function(e){r.TargetFile=e,n[o]="",c()},p):e.RegexSourceMap.test(i)?e.ExtractPath(i,a).then(function(e){n[o]="",r.SourceMap=""===e?null:e,c()}):c())}))}),Promise.all(c).then(function(){u.Content=n.join("\n"),i(u)},o)})},writable:!0,configurable:!0},Process:{value:function(t,n){return new Promise(function(r,i){FS.readFile(t,function(o,u){return o?i(o):void e.Parse(t,u.toString().split("\n"),n).then(function(e){n=e.Opts;var t=null!==n.SourceMap,o={Content:"",SourceMap:"",Opts:n},u=null;CoffeeScript=CoffeeScript||require("coffee-script");try{u=CoffeeScript.compile(e.Content,{sourceMap:!0})}catch(a){i(a)}o.Content=u.js,t&&(o.SourceMap=JSON.stringify(u.v3SourceMap)),n.SourceMap||"#!"===o.Content.substr(0,2)||(UglifyJS=UglifyJS||require("uglify-js"),u=UglifyJS.minify(o.Content||e.Content,{fromString:!0,outSourceMap:t?"js.map":void 0}),o.Content=u.code,t&&(o.SourceMap=u.map)),t&&(o.Content+="//# sourceMappingURL="+H.Relative(Path.dirname(n.TargetFile),n.SourceMap)),r(o)},i)})})},writable:!0,configurable:!0}}),e}();module.exports=CompilerCoffee;