"use strict"
module.exports = {
  extend: function(Out){
    Out = typeof Out === 'object' ? Out : {}
    for(let Index = 1; Index < arguments.length ; ++Index){
      if(arguments.hasOwnProperty(Index)){
        let Obj = arguments[Index]
        if(!Obj || typeof Obj !== 'object') continue // Skip non-object arguments
        for(let Key in Obj){
          if(Obj.hasOwnProperty(Key)){
            if(Obj[Key] && Obj[Key].constructor.name === 'Object'){
              Out[Key] = Out[Key] || {}
              $.extend(Out[Key], Obj[Key])
            } else Out[Key] = Obj[Key];
          }
        }
      }
    }
  }
}