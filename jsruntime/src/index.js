import { callNative, callNativeSync, map } from './bridge.js';
import * as fs from './modules/fs.js';
import { createModule } from './modules/module.js';
import * as path from './modules/path.js';

var mainModule = createModule({
  fs: fs,
  path: path
}, window.location.href);

window.resworb = {
  callNative: callNative,
  callNativeSync: callNativeSync,
  map: map
};

window.module = mainModule;
window.exports = mainModule.exports;
window.require = function require (path) {
  return mainModule.require(path);
};
window.__filename = mainModule.filename;
window.__dirname = path.dirname(mainModule.filename);

window.dispatchEvent(new Event('resworbready'));
