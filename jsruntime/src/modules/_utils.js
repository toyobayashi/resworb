export function notImplemented (msg) {
  var message = msg ? ('Not implemented: ' + msg) : 'Not implemented';
  throw new Error(message);
}
