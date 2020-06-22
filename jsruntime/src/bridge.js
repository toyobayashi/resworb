var _resworb = window.resworb;

var callbackMap = {};

function parseJavaResponse (res) {
  if (res === '') return undefined;
  return JSON.parse(res);
}

function callNative (name, arg) {
  return new Promise(function (resolve, reject) {
    var callid = Math.random().toString();
    callbackMap[callid] = {
      resolve: function (value) {
        delete callbackMap[callid];
        resolve(parseJavaResponse(value));
      },
      reject: function (err) {
        delete callbackMap[callid];
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

export { callNative, callNativeSync, callbackMap as map };
