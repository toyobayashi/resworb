import { callNative } from '../bridge.js';

export function show (message, position) {
  return callNative('toast', {
    message,
    gravity: position
  });
}
