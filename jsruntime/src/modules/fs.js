import Stat from './_fs/stat.js';
import { callNativeSync } from '../bridge.js';

export function readFileSync (p, toUtf8) {
  return callNativeSync('readFileSync', p);
}

export function existsSync (p) {
  return callNativeSync('existsSync', p);
}

export function statSync (p) {
  var obj = callNativeSync('statSync', p);
  return new Stat(obj);
}
