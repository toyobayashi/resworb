import './bridge.js';
import './modules/process.js';
import * as buffer from '@tybys/denostd/dist/esm/std/node/buffer.js';
import { createModule, makeRequireFunction } from './modules/module.js';
import * as fs from './modules/fs.js';
import * as path from '@tybys/denostd/dist/esm/std/path/mod.js';
import * as timers from '@tybys/denostd/dist/esm/std/node/timers.js';
import * as events from '@tybys/denostd/dist/esm/std/node/events.js';
import * as querystring from '@tybys/denostd/dist/esm/std/node/querystring.js';
import * as url from '@tybys/denostd/dist/esm/std/node/url.js';
import * as util from '@tybys/denostd/dist/esm/std/node/util.js';

import * as resworb from './modules/resworb.js';

var mainModule = createModule({
  fs: fs, // need implement readFileSync statSync existsSync
  path: path,
  buffer: buffer,
  timers: timers,
  events: events,
  querystring: querystring,
  url: url,
  util: util,
  resworb: resworb
}, window.location.href);

window.module = mainModule;
window.exports = mainModule.exports;
window.require = makeRequireFunction(mainModule, mainModule);
window.__filename = mainModule.filename;
window.__dirname = path.dirname(mainModule.filename);

Object.defineProperty(window, Symbol.toStringTag, {
  value: 'global',
  writable: false,
  enumerable: false,
  configurable: true
});

window.global = window;

window.setImmediate = timers.setImmediate;
window.clearImmediate = timers.clearImmediate;
