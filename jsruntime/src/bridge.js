import { ObjectId } from '@tybys/oid';

var _resworb = window.resworb;

var callbacks = {};

delete window.resworb;

Object.defineProperty(window, '__resworb_callbacks__', {
  configurable: false,
  enumerable: false,
  get: function () {
    return callbacks;
  }
});

function parseJavaResponse (res) {
  if (res === '') return undefined;
  return JSON.parse(res);
}

function callNative (name, arg) {
  return new Promise(function (resolve, reject) {
    var callid = new ObjectId().toHexString();
    callbacks[callid] = {
      resolve: function (value) {
        delete callbacks[callid];
        resolve(parseJavaResponse(value));
      },
      reject: function (err) {
        delete callbacks[callid];
        reject(err);
      }
    };
    _resworb.invoke(name, callid, arg != null ? ('' + JSON.stringify(arg)) : JSON.stringify({}));
  });
}

function callNativeSync (name, arg) {
  var res = _resworb.invokeSync(name, arg);
  return parseJavaResponse(res);
}

export { callNative, callNativeSync };
