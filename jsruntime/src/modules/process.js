import { notImplemented } from './_utils.js';
import { versions } from './_versions.js';
import { callNativeSync } from '../bridge.js';

function on (_event, _callback) {
  notImplemented();
}

function chdir () {
  notImplemented();
}

var env = callNativeSync('process_env', '');

export var process = {
  version: 'v' + versions.resworb,
  versions: versions,
  platform: 'android',
  arch: (function () {
    return callNativeSync('process_arch', '');
  })(),
  pid: (function () {
    return callNativeSync('process_pid', '');
  })(),
  cwd: function cwd () {
    return callNativeSync('process_cwd', '');
  },
  chdir: chdir,
  exit: function exit (code) {
    callNativeSync('process_exit', JSON.stringify(code || 0));
  },
  on,
  get env () {
    return env;
  },
  get argv () {
    return [];
  }
};

Object.defineProperty(process, Symbol.toStringTag, {
  enumerable: false,
  writable: true,
  configurable: false,
  value: 'process'
});

Object.defineProperty(window, 'process', {
  value: process,
  enumerable: false,
  writable: true,
  configurable: true
});
