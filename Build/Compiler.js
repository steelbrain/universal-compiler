"use strict";var _prototypeProperties=function(e,i,r){i&&Object.defineProperties(e,i),r&&Object.defineProperties(e.prototype,r)},_classCallCheck=function(e,i){if(!(e instanceof i))throw new TypeError("Cannot call a class as a function")},Promise=require("a-promise"),FS=require("fs"),H=require("./H"),Compiler=function(){function e(){_classCallCheck(this,e);var i=require("./Plugins/Compiler-JS"),r=require("./Plugins/Compiler-Coffee");i.init(this),this.Map={JS:{Compiler:i,Opts:{Compiler:"Babel"}},JSX:{Compiler:i,Opts:{Compiler:"Babel"}},TAG:{Compiler:i,Opts:{Compiler:"Riot"}},COFFEE:{Compiler:r,Opts:{}}}}return _prototypeProperties(e,null,{Compile:{value:function(e,i,r){return new Promise(function(t,o){FS.exists(e,function(n){if(!n)return o("Source file "+e+" doesn't exist");var p=e.split(".").pop().toUpperCase(),l=H.Clone(this.Map[p].Opts);return l.TargetFile=i||null,l.SourceMap=r||null,this.Map.hasOwnProperty(p)?void this.Map[p].Compiler.Process(e,l).then(function(e){return l=e.Opts,l.TargetFile?void FS.writeFile(l.TargetFile,e.Content,function(i){return i?o(i):void(l.SourceMap?FS.writeFile(l.SourceMap,e.SourceMap,t):t())}):t(e)},o):o("The given file type is not recognized")}.bind(this))}.bind(this))},writable:!0,configurable:!0}}),e}();module.exports=Compiler;