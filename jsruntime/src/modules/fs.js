import Stat from './_fs/stat.js';
import { callNativeSync } from '../bridge.js';

export function readFileSync (p, toUtf8) {
  var arr = callNativeSync('readFileSync', p);
  var buffer = Buffer.from(arr);
  if (toUtf8 === 'utf8' || toUtf8 === 'utf-8') {
    return new TextDecoder('utf-8').decode(buffer);
  }
  return buffer;
}

export function existsSync (p) {
  return callNativeSync('existsSync', p);
}

export function statSync (p) {
  var obj = callNativeSync('statSync', p);
  return new Stat(obj);
}
