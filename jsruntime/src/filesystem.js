import Stat from './stat.js';
import { callNativeSync } from './bridge.js';

/**
 * @constructor
 */
function Filesystem () {
}

/**
 * @type {((p: string) => Uint8Array) & ((p: string, toUtf8: true) => string)}
 */
Filesystem.prototype.readFileSync = function readFileSync (p, toUtf8) {
  return callNativeSync('readFileSync', p);
};

/**
 * @method
 * @param {string} p - path
 * @returns {boolean}
 */
Filesystem.prototype.existsSync = function existsSync (p) {
  return callNativeSync('existsSync', p);
};

/**
 * @method
 * @param {string} p - path
 * @returns {Stat}
 */
Filesystem.prototype.statSync = function statSync (p) {
  var obj = callNativeSync('statSync', p);
  return new Stat(obj);
};

export default Filesystem;
