import { callNative, callNativeSync, map } from './bridge.js';
import * as fs from './modules/fs.js';
import { createModule } from './modules/module.js';
import * as path from './modules/path.js';
import { process } from './modules/process.js';
import { Buffer } from './modules/buffer.js';

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

Object.defineProperty(window, Symbol.toStringTag, {
  value: 'global',
  writable: false,
  enumerable: false,
  configurable: true
});

Object.defineProperty(window, 'process', {
  value: process,
  enumerable: false,
  writable: true,
  configurable: true
});

Object.defineProperty(window, 'Buffer', {
  value: Buffer,
  enumerable: false,
  writable: true,
  configurable: true
});

window.global = window;

window.setImmediate = function setImmediate () {
  var cb = arguments[0];
  var args = Array.prototype.slice.call(arguments, 1);
  var applyArgs = ([cb, 0]).concat(args);
  return window.setTimeout.apply(window, applyArgs);
};

window.clearImmediate = window.clearTimeout;

window.dispatchEvent(new Event('resworbready'));
