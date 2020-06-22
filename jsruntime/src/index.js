import './bridge.js';
import * as fs from './modules/fs.js';
import { createModule } from './modules/module.js';
import { process } from './modules/process.js';
import * as buffer from '@tybys/denostd/dist/esm/std/node/buffer.js';
import * as path from '@tybys/denostd/dist/esm/std/path/mod.js';
import * as timers from '@tybys/denostd/dist/esm/std/node/timers.js';
import * as events from '@tybys/denostd/dist/esm/std/node/events.js';
import * as querystring from '@tybys/denostd/dist/esm/std/node/querystring.js';
import * as url from '@tybys/denostd/dist/esm/std/node/url.js';
import * as util from '@tybys/denostd/dist/esm/std/node/util.js';

var mainModule = createModule({
  fs: fs, // need implement readFileSync statSync existsSync
  path: path,
  buffer: buffer,
  timers: timers,
  events: events,
  querystring: querystring,
  url: url,
  util: util
}, window.location.href);

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

window.global = window;

window.setImmediate = timers.setImmediate;
window.clearImmediate = timers.clearImmediate;

window.dispatchEvent(new Event('resworbready'));
