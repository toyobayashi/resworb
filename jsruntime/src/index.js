import { callNative, callNativeSync, map } from './bridge.js';
import Filesystem from './filesystem.js';
import Modulesystem from './modulesystem.js';

var fs = new Filesystem();

// export { callNative, callNativeSync, map, fs }

window.resworb = {
  callNative: callNative,
  callNativeSync: callNativeSync,
  map: map,
  modules: new Modulesystem(fs)
};

window.dispatchEvent(new Event('resworbready'));

// (function () {
//   if (typeof resworb === 'undefined') {
//     return;
//   }

//   var _resworb = resworb;

//   var callbackMap = {};

//   function parseJavaResponse (res) {
//     if (res === '') return undefined;
//     return JSON.parse(res);
//   }
//   function callNative (name, arg) {
//     return new Promise((resolve, reject) => {
//       var callid = Math.random().toString();
//       callbackMap[callid] = {
//         resolve: function (value) {
//           delete callbackMap[callid];
//           resolve(parseJavaResponse(value));
//         },
//         reject: function (err) {
//           delete callbackMap[callid];
//           reject(err);
//         }
//       };
//       _resworb.invoke(name, callid, arg != null ? ('' + JSON.stringify(arg)) : JSON.stringify({}));
//     })
//   }

//   function callNativeSync (name, arg) {
//     var res = _resworb.invokeSync(name, arg);
//     return parseJavaResponse(res);
//   }

//   function readFileSync (path) {
//     return callNativeSync('readFileSync', path)
//   }

//   function existsSync (path) {
//     return callNativeSync('existsSync', path)
//   }

//   function statSync (path) {
//     var obj = callNativeSync('statSync', path)
//     return new Stat(obj);
//   }

//   window.resworb = {
//     callNative: callNative,
//     callNativeSync: callNativeSync,
//     map: callbackMap,
//     fs: {
//       readFileSync: readFileSync,
//       existsSync: existsSync,
//       statSync: statSync
//     }
//   };

//   window.dispatchEvent(new Event('resworbready'));

// })();
