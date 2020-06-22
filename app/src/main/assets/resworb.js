(function () {
  'use strict';

  var _resworb = window.resworb;

  var callbackMap = {};

  function parseJavaResponse (res) {
    if (res === '') return undefined;
    return JSON.parse(res);
  }

  function callNative (name, arg) {
    return new Promise(function (resolve, reject) {
      var callid = Math.random().toString();
      callbackMap[callid] = {
        resolve: function (value) {
          delete callbackMap[callid];
          resolve(parseJavaResponse(value));
        },
        reject: function (err) {
          delete callbackMap[callid];
          reject(err);
        }
      };
      _resworb.invoke(name, callid, arg != null ? ('' + JSON.stringify(arg)) : JSON.stringify({}));
    });
  }

  function callNativeSync (name, arg) {
    var res = _resworb.invokeSync(name, arg);
    return parseJavaResponse(res);
  }

  function Stat (obj) {
    Object.defineProperties(this, {
      _info: {
        configurable: false,
        enumerable: false,
        get: function () {
          return obj;
        }
      },
      size: {
        configurable: false,
        enumerable: true,
        writable: false,
        value: obj.size
      }
    });
  }

  Stat.prototype.isDirectory = function () {
    return this._info.dir;
  };

  Stat.prototype.isFile = function () {
    return !this._info.dir;
  };

  function readFileSync (p, toUtf8) {
    var arr = callNativeSync('readFileSync', p);
    var buffer = Buffer.from(arr);
    if (toUtf8 === 'utf8' || toUtf8 === 'utf-8') {
      return new TextDecoder('utf-8').decode(buffer);
    }
    return buffer;
  }

  function existsSync (p) {
    return callNativeSync('existsSync', p);
  }

  function statSync (p) {
    var obj = callNativeSync('statSync', p);
    return new Stat(obj);
  }

  var fs = /*#__PURE__*/Object.freeze({
    __proto__: null,
    readFileSync: readFileSync,
    existsSync: existsSync,
    statSync: statSync
  });

  var CHAR_DOT = 46;
  var CHAR_FORWARD_SLASH = 47;
  // export var CHAR_BACKWARD_SLASH = 92;

  var nmChars = [115, 101, 108, 117, 100, 111, 109, 95, 101, 100, 111, 110];

  var validateString = function validateString (value, name) {
    if (typeof value !== 'string') throw new TypeError('The "' + name + '" argument must be of type string. Received type ' + typeof value);
  };

  function resolve () {
    var args = Array.prototype.slice.call(arguments);
    var resolvedPath = '';
    var resolvedAbsolute = false;

    for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = i >= 0 ? args[i] : '/';

      validateString(path, 'path');

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, '/', isPosixPathSeparator);

    if (resolvedAbsolute) {
      return '/' + resolvedPath;
    }
    return resolvedPath.length > 0 ? resolvedPath : '.';
  }

  function normalize (path) {
    validateString(path, 'path');
    if (path.length === 0) { return '.'; }

    var isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    var trailingSeparator =
      path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;

    // Normalize the path
    path = normalizeString(path, !isAbsolute, '/', isPosixPathSeparator);

    if (path.length === 0) {
      if (isAbsolute) { return '/'; }
      return trailingSeparator ? './' : '.';
    }
    if (trailingSeparator) { path += '/'; }

    return isAbsolute ? ('/' + path) : path;
  }

  function isAbsolute (path) {
    validateString(path, 'path');
    return path.length > 0 && path.charCodeAt(0) === CHAR_FORWARD_SLASH;
  }

  function join () {
    var args = Array.prototype.slice.call(arguments);
    if (args.length === 0) { return '.'; }
    var joined;
    for (var i = 0; i < args.length; ++i) {
      var arg = args[i];
      validateString(arg, 'path');
      if (arg.length > 0) {
        if (joined === undefined) { joined = arg; } else { joined += ('/' + arg); }
      }
    }
    if (joined === undefined) { return '.'; }
    return normalize(joined);
  }

  function relative (from, to) {
    validateString(from, 'from');
    validateString(to, 'to');

    if (from === to) return '';

    // Trim leading forward slashes.
    from = resolve(from);
    to = resolve(to);

    if (from === to) return '';

    var fromStart = 1;
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;
    var toStart = 1;
    var toLen = to.length - toStart;

    // Compare paths to find the longest common path from root
    var length = (fromLen < toLen ? fromLen : toLen);
    var lastCommonSep = -1;
    var i = 0;
    for (; i < length; i++) {
      var fromCode = from.charCodeAt(fromStart + i);
      if (fromCode !== to.charCodeAt(toStart + i)) break;
      else if (fromCode === CHAR_FORWARD_SLASH) lastCommonSep = i;
    }
    if (i === length) {
      if (toLen > length) {
        if (to.charCodeAt(toStart + i) === CHAR_FORWARD_SLASH) {
          // We get here if `from` is the exact base path for `to`.
          // For example: from='/foo/bar'; to='/foo/bar/baz'
          return to.slice(toStart + i + 1);
        }
        if (i === 0) {
          // We get here if `from` is the root
          // For example: from='/'; to='/foo'
          return to.slice(toStart + i);
        }
      } else if (fromLen > length) {
        if (from.charCodeAt(fromStart + i) === CHAR_FORWARD_SLASH) {
          // We get here if `to` is the exact base path for `from`.
          // For example: from='/foo/bar/baz'; to='/foo/bar'
          lastCommonSep = i;
        } else if (i === 0) {
          // We get here if `to` is the root.
          // For example: from='/foo/bar'; to='/'
          lastCommonSep = 0;
        }
      }
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`.
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === CHAR_FORWARD_SLASH) {
        out += out.length === 0 ? '..' : '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts.
    return out + to.slice(toStart + lastCommonSep);
  }

  function toNamespacedPath (path) {
    // Non-op on posix systems
    return path;
  }

  function dirname (path) {
    validateString(path, 'path');
    if (path.length === 0) { return '.'; }
    var hasRoot = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) { return hasRoot ? '/' : '.'; }
    if (hasRoot && end === 1) { return '//'; }
    return path.slice(0, end);
  }

  function basename (path, ext) {
    if (ext !== undefined) validateString(ext, 'ext');
    validateString(path, 'path');
    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext === path) { return ''; }
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === CHAR_FORWARD_SLASH) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) { end = firstNonSlashEnd; } else if (end === -1) { end = path.length; }
      return path.slice(start, end);
    }
    for (i = path.length - 1; i >= 0; --i) {
      if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // path component
        matchedSlash = false;
        end = i + 1;
      }
    }

    if (end === -1) { return ''; }
    return path.slice(start, end);
  }

  function extname (path) {
    validateString(path, 'path');
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === CHAR_FORWARD_SLASH) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === CHAR_DOT) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1) {
          startDot = i;
        } else if (preDotState !== 1) {
          preDotState = 1;
        }
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 &&
        startDot === end - 1 &&
        startDot === startPart + 1)) {
      return '';
    }
    return path.slice(startDot, end);
  }

  function format (pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    var dir = pathObject.dir || pathObject.root;
    var base = pathObject.base || ((pathObject.name || '') + (pathObject.ext || ''));
    if (!dir) {
      return base;
    }
    return dir === pathObject.root ? (dir + base) : (dir + '/' + base);
  }

  function parse (path) {
    validateString(path, 'path');

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      var code = path.charCodeAt(i);
      if (code === CHAR_FORWARD_SLASH) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === CHAR_DOT) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1) startDot = i;
        else if (preDotState !== 1) preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (end !== -1) {
      var _start = startPart === 0 && isAbsolute ? 1 : startPart;
      if (startDot === -1 ||
          // We saw a non-dot character immediately before the dot
          preDotState === 0 ||
          // The (right-most) trimmed path component is exactly '..'
          (preDotState === 1 &&
          startDot === end - 1 &&
          startDot === startPart + 1)) {
        ret.base = ret.name = path.slice(_start, end);
      } else {
        ret.name = path.slice(_start, startDot);
        ret.base = path.slice(_start, end);
        ret.ext = path.slice(startDot, end);
      }
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute) ret.dir = '/';

    return ret;
  }

  var sep = '/';
  var delimiter = ':';

  // Resolves . and .. elements in a path with directory names
  function normalizeString (path, allowAboveRoot, separator, isPathSeparator) {
    var res = '';
    var lastSegmentLength = 0;
    var lastSlash = -1;
    var dots = 0;
    var code = 0;
    for (var i = 0; i <= path.length; ++i) {
      if (i < path.length) { code = path.charCodeAt(i); } else if (isPathSeparator(code)) { break; } else { code = CHAR_FORWARD_SLASH; }

      if (isPathSeparator(code)) {
        if (lastSlash === i - 1 || dots === 1) ; else if (dots === 2) {
          if (res.length < 2 || lastSegmentLength !== 2 ||
              res.charCodeAt(res.length - 1) !== CHAR_DOT ||
              res.charCodeAt(res.length - 2) !== CHAR_DOT) {
            if (res.length > 2) {
              var lastSlashIndex = res.lastIndexOf(separator);
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
              }
              lastSlash = i;
              dots = 0;
              continue;
            } else if (res.length !== 0) {
              res = '';
              lastSegmentLength = 0;
              lastSlash = i;
              dots = 0;
              continue;
            }
          }
          if (allowAboveRoot) {
            res += res.length > 0 ? (separator + '..') : '..';
            lastSegmentLength = 2;
          }
        } else {
          if (res.length > 0) { res += (separator + path.slice(lastSlash + 1, i)); } else { res = path.slice(lastSlash + 1, i); }
          lastSegmentLength = i - lastSlash - 1;
        }
        lastSlash = i;
        dots = 0;
      } else if (code === CHAR_DOT && dots !== -1) {
        ++dots;
      } else {
        dots = -1;
      }
    }
    return res;
  }

  function isPosixPathSeparator (code) {
    return code === CHAR_FORWARD_SLASH;
  }

  var path = /*#__PURE__*/Object.freeze({
    __proto__: null,
    resolve: resolve,
    normalize: normalize,
    isAbsolute: isAbsolute,
    join: join,
    relative: relative,
    toNamespacedPath: toNamespacedPath,
    dirname: dirname,
    basename: basename,
    extname: extname,
    format: format,
    parse: parse,
    sep: sep,
    delimiter: delimiter
  });

  var nmLen = nmChars.length;

  var statCache = Object.create(null);

  function stripBOM (content) {
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
  }

  function createModule (builtinModules, entry) {
    builtinModules.module = Module;
    var fs = builtinModules.fs;
    var path$1 = builtinModules.path || path;

    var modulePaths = [];
    var packageJsonCache = Object.create(null);

    var mainModule = new Module(entry || '/', null);
    mainModule.filename = entry;
    mainModule.loaded = true;

    function resolve () {
      var args = Array.prototype.slice.call(arguments);
      if (args.length > 0 && args[0].indexOf('file://') === 0) {
        args[0] = args[0].substring(7);
        return 'file://' + path$1.resolve.apply(undefined, args);
      }
      return path$1.resolve.apply(undefined, args);
    }

    function join () {
      var args = Array.prototype.slice.call(arguments);
      if (args.length > 0 && args[0].indexOf('file://') === 0) {
        args[0] = args[0].substring(7);
        return 'file://' + path$1.join.apply(undefined, args);
      }
      return path$1.join.apply(undefined, args);
    }

    function statSync (p) {
      if (statCache[p]) {
        return statCache[p];
      }
      var stat = fs.statSync(p);
      statCache[p] = stat;
      return stat;
    }

    function makeRequireFunction (mod) {
      var Module = mod.constructor;
      var require = function require (path) {
        return mod.require(path);
      };

      function resolve (request) {
        validateString(request, 'request');
        return Module._resolveFilename(request, mod, false);
      }

      require.resolve = resolve;

      function paths (request) {
        validateString(request, 'request');
        return Module._resolveLookupPaths(request, mod);
      }

      resolve.paths = paths;
      require.main = mainModule;
      require.extensions = Module._extensions;
      require.cache = Module._cache;

      return require;
    }

    function Module (id, parent) {
      this.id = id;
      this.filename = null;
      this.path = path$1.dirname(id);
      this.parent = parent;
      if (parent) {
        parent.children.push(this);
      }
      this.loaded = false;
      this.exports = {};
      this.children = [];
    }

    Module._cache = Object.create(null);
    Module._pathCache = Object.create(null);
    Module._extensions = Object.create(null);

    Module._extensions['.js'] = function (module, filename) {
      var content = fs.readFileSync(filename, 'utf8');
      // eslint-disable-next-line no-new-func
      var moduleWrapper = new Function('exports', 'require', 'module', '__filename', '__dirname', stripBOM(content));
      moduleWrapper.call(module.exports, module.exports, makeRequireFunction(module), module, filename, path$1.dirname(filename));
    };

    Module._extensions['.json'] = function (module, filename) {
      var content = fs.readFileSync(filename, 'utf8');
      try {
        module.exports = JSON.parse(stripBOM(content));
      } catch (err) {
        err.message = filename + ': ' + err.message;
        throw err;
      }
    };

    Module._nodeModulePaths = function _nodeModulePaths (from) {
      // Guarantee that 'from' is absolute.
      from = resolve(from);
      // Return early not only to avoid unnecessary work, but to *avoid* returning
      // an array of two items for a root: [ '//node_modules', '/node_modules' ]
      if (from === '/') return ['/node_modules'];

      // note: this approach *only* works when the path is guaranteed
      // to be absolute.  Doing a fully-edge-case-correct path.split
      // that works on both Windows and Posix is non-trivial.
      var paths = [];
      var p = 0;
      var last = from.length;
      for (var i = from.length - 1; i >= 0; --i) {
        var code = from.charCodeAt(i);
        if (code === CHAR_FORWARD_SLASH) {
          if (p !== nmLen) {
            paths.push(from.slice(0, last) + '/node_modules');
          }
          last = i;
          p = 0;
        } else if (p !== -1) {
          if (nmChars[p] === code) {
            ++p;
          } else {
            p = -1;
          }
        }
      }

      if (from.indexOf('file://') === 0) {
        var removeIndex = paths.indexOf('file://node_modules');
        if (removeIndex !== -1) {
          paths.splice(removeIndex, 1);
        }
      }

      // Append /node_modules to handle root paths.
      paths.push('/node_modules');

      return paths;
    };

    Module._resolveLookupPaths = function _resolveLookupPaths (request, parent) {
      // Check for node modules paths.
      // eslint-disable-next-line no-constant-condition
      if (request.charAt(0) !== '.' ||
          (request.length > 1 &&
          request.charAt(1) !== '.' &&
          request.charAt(1) !== '/' &&
          (true ))) {
        var paths = modulePaths;
        if (parent != null && parent.paths && parent.paths.length) {
          paths = parent.paths.concat(paths);
        }

        return paths.length > 0 ? paths : null;
      }

      // With --eval, parent.id is not set and parent.filename is null.
      if (!parent || !parent.id || !parent.filename) {
        // Make require('./path/to/foo') work - normally the path is taken
        // from realpath(__filename) but with eval there is no filename
        var mainPaths = ['.'].concat(Module._nodeModulePaths('.'), modulePaths);

        return mainPaths;
      }

      var parentDir = [path$1.dirname(parent.filename)];
      return parentDir;
    };

    Module._findPath = function _findPath (request, paths, isMain) {
      var absoluteRequest = path$1.isAbsolute(request) || request.indexOf('file://') === 0;
      if (absoluteRequest) {
        paths = [''];
      } else if (!paths || paths.length === 0) {
        return false;
      }

      var cacheKey = request + '\x00' +
                    (paths.length === 1 ? paths[0] : paths.join('\x00'));
      var entry = Module._pathCache[cacheKey];
      if (entry) return entry;

      var exts;
      var trailingSlash = request.length > 0 &&
        request.charCodeAt(request.length - 1) === CHAR_FORWARD_SLASH;
      if (!trailingSlash) {
        trailingSlash = /(?:^|\/)\.?\.$/.test(request);
      }

      // For each path
      for (var i = 0; i < paths.length; i++) {
        // Don't search further if path doesn't exist
        var curPath = paths[i];
        if (curPath && !fs.existsSync(curPath)) continue;
        var basePath = resolveExports(curPath, request);
        var filename;

        if (!trailingSlash) {
          if (fs.existsSync(basePath)) {
            var stat = statSync(basePath);
            if (stat.isFile()) {
              return basePath;
            }
            if (stat.isDirectory()) {
              // try it with each of the extensions at "index"
              if (exts === undefined) {
                exts = Object.keys(Module._extensions);
              }
              filename = tryPackage(basePath, exts, isMain, request);
            }
          } else {
            // Try it with each of the extensions
            if (exts === undefined) {
              exts = Object.keys(Module._extensions);
            }
            filename = tryExtensions(basePath, exts);
          }
        } else {
          // try it with each of the extensions at "index"
          if (exts === undefined) {
            exts = Object.keys(Module._extensions);
          }
          filename = tryPackage(basePath, exts, isMain, request);
        }

        if (filename) {
          Module._pathCache[cacheKey] = filename;
          return filename;
        }
      }
      return false;
    };

    Module._resolveFilename = function _resolveFilename (request, parent, isMain/* , options */) {
      var paths = Module._resolveLookupPaths(request, parent);

      // Look up the filename first, since that's the cache key.
      var filename = Module._findPath(request, paths, isMain);
      if (!filename) {
        var requireStack = [];
        for (var cursor = parent;
          cursor;
          cursor = cursor.parent) {
          requireStack.push(cursor.filename || cursor.id);
        }
        var message = 'Cannot find module \'' + request + '\'';
        if (requireStack.length > 0) {
          message = message + '\nRequire stack:\n- ' + requireStack.join('\n- ');
        }
        // eslint-disable-next-line no-restricted-syntax
        var err = new Error(message);
        err.code = 'MODULE_NOT_FOUND';
        err.requireStack = requireStack;
        throw err;
      }
      return filename;
    };

    Module.Module = Module;

    Module.prototype.require = function require (request) {
      try {
        return getBuiltinModule(request);
      } catch (_) {}

      var filename = Module._resolveFilename(request, this, false);

      if (!fs.existsSync(filename)) {
        throw new Error('Cannot find module \'' + filename + '\'. ');
      }

      if (Module._cache[filename]) {
        return Module._cache[filename].exports;
      }

      var module = Module._cache[filename] = new Module(filename, this);
      module.filename = filename;
      module.paths = Module._nodeModulePaths(path$1.dirname(filename));
      Module._extensions[path$1.extname(filename)](module, filename);
      module.loaded = true;
      return module.exports;
    };

    function resolveExports (nmPath, request) {
      if (request.indexOf('file://') === 0) {
        return request;
      }
      return resolve(nmPath, request);
    }

    function tryFile (requestPath, isMain) {
      if (fs.existsSync(requestPath) && statSync(requestPath).isFile()) {
        return requestPath;
      }
      return false;
    }
    // Given a path, check if the file exists with any of the set extensions
    function tryExtensions (p, exts, isMain) {
      for (var i = 0; i < exts.length; i++) {
        var filename = tryFile(p + exts[i]);

        if (filename) {
          return filename;
        }
      }
      return false;
    }

    function readPackage (requestPath) {
      var p = join(requestPath, 'package.json');
      if (packageJsonCache[p]) return packageJsonCache[p];
      var json;
      try {
        json = fs.readFileSync(p, 'utf8');
      } catch (_) {
        return null;
      }
      try {
        var parsed = JSON.parse(json);
        var filtered = {
          main: parsed.main,
          exports: parsed.exports,
          type: parsed.type
        };
        packageJsonCache[p] = filtered;
        return filtered;
      } catch (e) {
        e.path = p;
        e.message = 'Error parsing ' + p + ': ' + e.message;
        throw e;
      }
    }

    function readPackageMain (requestPath) {
      var pkg = readPackage(requestPath);
      return pkg ? pkg.main : undefined;
    }

    function tryPackage (requestPath, exts, isMain, originalPath) {
      var pkg = readPackageMain(requestPath);

      if (!pkg) {
        return tryExtensions(resolve(requestPath, 'index'), exts);
      }

      var filename = resolve(requestPath, pkg);
      var actual = tryFile(filename) ||
        tryExtensions(filename, exts) ||
        tryExtensions(resolve(filename, 'index'), exts);
      if (actual === false) {
        actual = tryExtensions(resolve(requestPath, 'index'), exts);
        if (!actual) {
          // eslint-disable-next-line no-restricted-syntax
          var err = new Error(
            'Cannot find module \'' + filename + '\'. ' +
            'Please verify that the package.json has a valid "main" entry'
          );
          err.code = 'MODULE_NOT_FOUND';
          err.path = resolve(requestPath, 'package.json');
          err.requestPath = originalPath;
          // TODO(BridgeAR): Add the requireStack as well.
          throw err;
        }
      }
      return actual;
    }

    function getBuiltinModule (request) {
      if (request in builtinModules && Object.prototype.hasOwnProperty.call(builtinModules, request)) {
        return builtinModules[request];
      }
      throw new Error('Cannot find module \'' + request + '\'. ');
    }

    return mainModule;
  }

  function notImplemented (msg) {
    var message = msg ? ('Not implemented: ' + msg) : 'Not implemented';
    throw new Error(message);
  }

  var resworbVersion = '0.0.0-dev';

  var versions = {
    node: resworbVersion,
    resworb: resworbVersion,
    deno: '0.58.0'
  };

  function on (_event, _callback) {
    notImplemented();
  }

  function chdir () {
    notImplemented();
  }

  var env = callNativeSync('process_env', '');

  var process = {
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

  /* eslint-disable */

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it;

    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  /**
   * See also https://nodejs.org/api/buffer.html
   */
  var Buffer$1 = /*#__PURE__*/function (_Uint8Array) {
    _inherits(Buffer, _Uint8Array);

    var _super = _createSuper(Buffer);

    function Buffer() {
      _classCallCheck(this, Buffer);

      return _super.apply(this, arguments);
    }

    _createClass(Buffer, [{
      key: "copy",

      /**
       * Copies data from a region of buf to a region in target, even if the target
       * memory region overlaps with buf.
       */
      value: function copy(targetBuffer) {
        var targetStart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var sourceStart = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var sourceEnd = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.length;
        var sourceBuffer = this.subarray(sourceStart, sourceEnd);
        targetBuffer.set(sourceBuffer, targetStart);
        return sourceBuffer.length;
      }
    }, {
      key: "readBigInt64BE",
      value: function readBigInt64BE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getBigInt64(offset);
      }
    }, {
      key: "readBigInt64LE",
      value: function readBigInt64LE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getBigInt64(offset, true);
      }
    }, {
      key: "readBigUInt64BE",
      value: function readBigUInt64BE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getBigUint64(offset);
      }
    }, {
      key: "readBigUInt64LE",
      value: function readBigUInt64LE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getBigUint64(offset, true);
      }
    }, {
      key: "readDoubleBE",
      value: function readDoubleBE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getFloat64(offset);
      }
    }, {
      key: "readDoubleLE",
      value: function readDoubleLE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getFloat64(offset, true);
      }
    }, {
      key: "readFloatBE",
      value: function readFloatBE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getFloat32(offset);
      }
    }, {
      key: "readFloatLE",
      value: function readFloatLE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getFloat32(offset, true);
      }
    }, {
      key: "readInt8",
      value: function readInt8() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getInt8(offset);
      }
    }, {
      key: "readInt16BE",
      value: function readInt16BE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getInt16(offset);
      }
    }, {
      key: "readInt16LE",
      value: function readInt16LE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getInt16(offset, true);
      }
    }, {
      key: "readInt32BE",
      value: function readInt32BE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getInt32(offset);
      }
    }, {
      key: "readInt32LE",
      value: function readInt32LE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getInt32(offset, true);
      }
    }, {
      key: "readUInt8",
      value: function readUInt8() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getUint8(offset);
      }
    }, {
      key: "readUInt16BE",
      value: function readUInt16BE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getUint16(offset);
      }
    }, {
      key: "readUInt16LE",
      value: function readUInt16LE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getUint16(offset, true);
      }
    }, {
      key: "readUInt32BE",
      value: function readUInt32BE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getUint32(offset);
      }
    }, {
      key: "readUInt32LE",
      value: function readUInt32LE() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new DataView(this.buffer, this.byteOffset, this.byteLength).getUint32(offset, true);
      }
      /**
       * Returns a new Buffer that references the same memory as the original, but
       * offset and cropped by the start and end indices.
       */

    }, {
      key: "slice",
      value: function slice() {
        var begin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.length;
        // workaround for https://github.com/microsoft/TypeScript/issues/38665
        return this.subarray(begin, end);
      }
      /**
       * Returns a JSON representation of buf. JSON.stringify() implicitly calls
       * this function when stringifying a Buffer instance.
       */

    }, {
      key: "toJSON",
      value: function toJSON() {
        return {
          type: "Buffer",
          data: Array.from(this)
        };
      }
      /**
       * Decodes buf to a string according to the specified character encoding in
       * encoding. start and end may be passed to decode only a subset of buf.
       */

    }, {
      key: "toString",
      value: function toString() {
        var encoding = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "utf8";
        var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.length;
        return new TextDecoder(encoding).decode(this.subarray(start, end));
      }
      /**
       * Writes string to buf at offset according to the character encoding in
       * encoding. The length parameter is the number of bytes to write. If buf did
       * not contain enough space to fit the entire string, only part of string will
       * be written. However, partially encoded characters will not be written.
       */

    }, {
      key: "write",
      value: function write(string) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.length;
        return new TextEncoder().encodeInto(string, this.subarray(offset, offset + length)).written;
      }
    }, {
      key: "writeBigInt64BE",
      value: function writeBigInt64BE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setBigInt64(offset, value);
        return offset + 4;
      }
    }, {
      key: "writeBigInt64LE",
      value: function writeBigInt64LE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setBigInt64(offset, value, true);
        return offset + 4;
      }
    }, {
      key: "writeBigUInt64BE",
      value: function writeBigUInt64BE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setBigUint64(offset, value);
        return offset + 4;
      }
    }, {
      key: "writeBigUInt64LE",
      value: function writeBigUInt64LE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setBigUint64(offset, value, true);
        return offset + 4;
      }
    }, {
      key: "writeDoubleBE",
      value: function writeDoubleBE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setFloat64(offset, value);
        return offset + 8;
      }
    }, {
      key: "writeDoubleLE",
      value: function writeDoubleLE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setFloat64(offset, value, true);
        return offset + 8;
      }
    }, {
      key: "writeFloatBE",
      value: function writeFloatBE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setFloat32(offset, value);
        return offset + 4;
      }
    }, {
      key: "writeFloatLE",
      value: function writeFloatLE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setFloat32(offset, value, true);
        return offset + 4;
      }
    }, {
      key: "writeInt8",
      value: function writeInt8(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setInt8(offset, value);
        return offset + 1;
      }
    }, {
      key: "writeInt16BE",
      value: function writeInt16BE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setInt16(offset, value);
        return offset + 2;
      }
    }, {
      key: "writeInt16LE",
      value: function writeInt16LE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setInt16(offset, value, true);
        return offset + 2;
      }
    }, {
      key: "writeInt32BE",
      value: function writeInt32BE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setUint32(offset, value);
        return offset + 4;
      }
    }, {
      key: "writeInt32LE",
      value: function writeInt32LE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setInt32(offset, value, true);
        return offset + 4;
      }
    }, {
      key: "writeUInt8",
      value: function writeUInt8(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setUint8(offset, value);
        return offset + 1;
      }
    }, {
      key: "writeUInt16BE",
      value: function writeUInt16BE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setUint16(offset, value);
        return offset + 2;
      }
    }, {
      key: "writeUInt16LE",
      value: function writeUInt16LE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setUint16(offset, value, true);
        return offset + 2;
      }
    }, {
      key: "writeUInt32BE",
      value: function writeUInt32BE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setUint32(offset, value);
        return offset + 4;
      }
    }, {
      key: "writeUInt32LE",
      value: function writeUInt32LE(value) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        new DataView(this.buffer, this.byteOffset, this.byteLength).setUint32(offset, value, true);
        return offset + 4;
      }
    }], [{
      key: "alloc",

      /**
       * Allocates a new Buffer of size bytes.
       */
      value: function alloc(size) {
        return new Buffer(size);
      }
      /**
       * Returns the byte length of a string when encoded. This is not the same as
       * String.prototype.length, which does not account for the encoding that is
       * used to convert the string into bytes.
       */

    }, {
      key: "byteLength",
      value: function byteLength(string) {
        if (typeof string != "string") return string.byteLength;
        return new TextEncoder().encode(string).length;
      }
      /**
       * Returns a new Buffer which is the result of concatenating all the Buffer
       * instances in the list together.
       */

    }, {
      key: "concat",
      value: function concat(list, totalLength) {
        if (totalLength == undefined) {
          totalLength = 0;

          var _iterator = _createForOfIteratorHelper(list),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var buf = _step.value;
              totalLength += buf.length;
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }

        var buffer = new Buffer(totalLength);
        var pos = 0;

        var _iterator2 = _createForOfIteratorHelper(list),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _buf = _step2.value;
            buffer.set(_buf, pos);
            pos += _buf.length;
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        return buffer;
      } // eslint-disable-next-line @typescript-eslint/no-explicit-any

    }, {
      key: "from",
      value: function from(value, offset, length) {
        if (typeof value == "string") return new Buffer(new TextEncoder().encode(value).buffer); // workaround for https://github.com/microsoft/TypeScript/issues/38446

        return new Buffer(value, offset, length);
      }
      /**
       * Returns true if obj is a Buffer, false otherwise.
       */

    }, {
      key: "isBuffer",
      value: function isBuffer(obj) {
        return obj instanceof Buffer;
      }
    }]);

    return Buffer;
  }( /*#__PURE__*/_wrapNativeSuper(Uint8Array));

  var buffer = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Buffer: Buffer$1,
    'default': Buffer$1
  });

  var mainModule = createModule({
    fs: fs, // need implement readFileSync statSync existsSync
    path: path,
    buffer: buffer
  }, window.location.href);

  window.resworb = {
    callNative: callNative,
    callNativeSync: callNativeSync,
    map: callbackMap
  };

  window.module = mainModule;
  window.exports = mainModule.exports;
  window.require = function require (path) {
    return mainModule.require(path);
  };
  window.__filename = mainModule.filename;
  window.__dirname = dirname(mainModule.filename);

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
    value: Buffer$1,
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

}());
