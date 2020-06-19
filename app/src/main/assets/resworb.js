(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  var _resworb = window.resworb;

  var callbackMap = {};

  function parseJavaResponse (res) {
    if (res === '') return undefined;
    return JSON.parse(res);
  }

  function callNative (name, arg) {
    return new Promise((resolve, reject) => {
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

  var CHAR_DOT = 46;
  var CHAR_FORWARD_SLASH = 47;
  // export var CHAR_BACKWARD_SLASH = 92;

  var nmChars = [115, 101, 108, 117, 100, 111, 109, 95, 101, 100, 111, 110];

  var validateString = function validateString (value, name) {
    if (typeof value !== 'string') throw new TypeError('The "' + name + '" argument must be of type string. Received type ' + typeof value);
  };

  var validateFunction = function validateFunction (value, name) {
    if (typeof value !== 'function') throw new TypeError('The "' + name + '" argument must be of type function. Received type ' + typeof value);
  };

  // Based on http://stackoverflow.com/a/22747272/680742, the browser with

  function slice (thisArg, start, end) {
    var len = thisArg.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;

    if (start < 0) {
      start += len;
      if (start < 0) start = 0;
    } else if (start > len) {
      start = len;
    }

    if (end < 0) {
      end += len;
      if (end < 0) end = 0;
    } else if (end > len) {
      end = len;
    }

    if (end < start) end = start;

    var newBuf = thisArg.subarray(start, end);

    return newBuf;
  }

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

  var globalBuiltins = Object.create(null);
  var extensions = Object.create(null);

  Object.defineProperty(globalBuiltins, 'path', {
    configurable: false,
    writable: false,
    enumerable: true,
    value: path
  });

  function requireModule (moduleName) {
    validateString(moduleName, 'moduleName');
    if (moduleName in globalBuiltins) {
      return globalBuiltins[moduleName];
    }
    throw new Error('Cannot find module \'' + moduleName + '\'. ');
  }

  function injectModule (moduleName, m) {
    validateString(moduleName, 'moduleName');
    if (typeof m === 'function') {
      var module = { exports: {} };
      m.call(module.exports, module.exports, function require (moduleName) {
        return requireModule(moduleName);
      }, module);
      globalBuiltins[moduleName] = module.exports;
    } else {
      globalBuiltins[moduleName] = m;
    }
  }

  function extendModule (ext, compilerFactory) {
    validateString(ext, 'ext');
    validateFunction(compilerFactory, 'compilerFactory');
    extensions[ext] = compilerFactory;
  }

  function stripBOM (content) {
    if (content.charCodeAt(0) === 0xFEFF) {
      content = slice(content, 1);
    }
    return content;
  }

  function createModuleClass (fs, makeRequireFunction) {
    var modulePaths = [];
    var packageJsonCache = Object.create(null);

    function Module (id, parent) {
      this.id = id;
      this.filename = null;
      this.path = dirname(id);
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
      moduleWrapper.call(module.exports, module.exports, makeRequireFunction(module), module, filename, dirname(filename));
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

    for (var ext in extensions) {
      var internals = Object.keys(Module._extensions);
      if (internals.indexOf(ext) === -1) {
        Module._extensions[ext] = extensions[ext](function require (moduleName) {
          return getBuiltinModule(moduleName);
        });
      }
    }

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

      var parentDir = [dirname(parent.filename)];
      return parentDir;
    };

    Module._findPath = function _findPath (request, paths, isMain) {
      var absoluteRequest = isAbsolute(request) || request.indexOf('file://') === 0;
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
            var stat = fs.statSync(basePath);
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
      module.paths = Module._nodeModulePaths(dirname(filename));
      Module._extensions[extname(filename)](module, filename);
      module.loaded = true;
      return module.exports;
    };

    function resolveExports (nmPath, request) {
      return resolve(nmPath, request);
    }

    function tryFile (requestPath, isMain) {
      if (fs.existsSync(requestPath) && fs.statSync(requestPath).isFile()) {
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
      switch (request) {
        case 'fs': return fs;
        case 'module': return Module;
        default: return requireModule(request);
      }
    }

    return Module;
  }

  function defineProperty (o, key, value) {
    return Object.defineProperty(o, key, {
      configurable: false,
      writable: false,
      enumerable: true,
      value: value
    });
  }

  /**
   * @constructor
   * @param {Filesystem} fs
   */
  function Modulesystem (fs) {
    if (!(this instanceof Modulesystem)) {
      return new Modulesystem(fs);
    }

    this.mainModule = null;
    this.builtins = Object.create(null);
    defineProperty(this.builtins, 'fs', fs);
    var makeRequireFunction = (function (ms) {
      return function makeRequireFunction (mod) {
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
        require.main = ms.mainModule;
        require.extensions = Module._extensions;
        require.cache = Module._cache;

        return require;
      };
    })(this);
    defineProperty(this.builtins, 'module', createModuleClass(fs, makeRequireFunction));
  }

  /**
   * Run an asar package like a Node.js project.
   * @param {string=} entry - entry module path
   * @returns {any} module.exports of entry module
   */
  Modulesystem.prototype.run = function run (entry) {
    entry = entry !== undefined ? entry : '/';
    validateString(entry);

    var Module = this.builtins.module;
    var entryPath = Module._resolveFilename(entry, null, true);
    var module = Module._cache[entryPath] = new Module(entryPath, null);
    module.filename = entryPath;
    module.paths = Module._nodeModulePaths(dirname(entryPath));
    this.mainModule = module;
    try {
      Module._extensions[extname(entryPath)](module, entryPath);
    } catch (err) {
      delete Module._cache[entryPath];
      this.mainModule = null;
      throw err;
    }
    module.loaded = true;

    return module.exports;
  };

  /**
   * Require builtin module.
   * @param {string} moduleName - module name
   * @returns {any}
   */
  Modulesystem.prototype.require = function require (moduleName) {
    validateString(moduleName, 'moduleName');
    if (moduleName in this.builtins) {
      return this.builtins[moduleName];
    }
    if (moduleName in globalBuiltins) {
      return globalBuiltins[moduleName];
    }
    throw new Error('Cannot find module \'' + moduleName + '\'. ');
  };

  /**
   * Inject builtin module that can be required in asar package.
   * @param {string} moduleName - module name
   * @param {any} m - function or any value
   */
  Modulesystem.prototype.inject = function inject (moduleName, m) {
    validateString(moduleName, 'moduleName');
    if (typeof m === 'function') {
      var module = { exports: {} };
      m.call(module.exports, module.exports, this.require.bind(this), module);
      this.builtins[moduleName] = module.exports;
    } else {
      this.builtins[moduleName] = m;
    }
  };

  /**
   * Handle custom file format.
   * @param {string} ext - extension
   * @param {(this: Modulesystem, require: (this: Modulesystem, moduleName: string) => any) => (module: InstanceType<ReturnType<createModuleClass>>, filename: string) => void} compilerFactory - how to load file
   */
  Modulesystem.prototype.extend = function extend (ext, compilerFactory) {
    validateString(ext, 'ext');
    validateFunction(compilerFactory, 'compilerFactory');
    this.builtins.module._extensions[ext] = compilerFactory.call(this, this.require.bind(this));
  };

  /**
   * Run an asar package like a Node.js project.
   * @param {Filesystem} fs - Filesystem object
   * @param {string=} entry - entry module path
   * @returns {any} module.exports of entry module
   */
  Modulesystem.run = function run (fs, entry) {
    var ms = new Modulesystem(fs);
    return ms.run(entry);
  };

  /**
   * Require global builtin module.
   * @param {string} moduleName - module name
   * @returns {any}
   */
  Modulesystem.require = function require (moduleName) {
    return requireModule(moduleName);
  };

  /**
   * Inject global builtin module that can be required in asar package.
   * @param {string} moduleName - module name
   * @param {any} m - function or any value
   */
  Modulesystem.inject = function inject (moduleName, m) {
    injectModule(moduleName, m);
  };

  /**
   * Handle custom file format.
   * @param {string} ext - extension
   * @param {(require: (moduleName: string) => any) => (module: InstanceType<ReturnType<createModuleClass>>, filename: string) => void} compilerFactory - how to load file
   */
  Modulesystem.extend = function extend (ext, compilerFactory) {
    extendModule(ext, compilerFactory);
  };

  var fs = new Filesystem();

  // export { callNative, callNativeSync, map, fs }

  window.resworb = {
    callNative: callNative,
    callNativeSync: callNativeSync,
    map: callbackMap,
    modules: new Modulesystem(fs)
  };

  window.dispatchEvent(new Event('resworbready'));

  // (function () {
  //   if (typeof resworb === 'undefined') {
  //     return;
  //   }

  //   var _resworb = resworb;

  //   var callbackMap = {};

  //   function parseJavaResponse (res) {
  //     if (res === '') return undefined;
  //     return JSON.parse(res);
  //   }
  //   function callNative (name, arg) {
  //     return new Promise((resolve, reject) => {
  //       var callid = Math.random().toString();
  //       callbackMap[callid] = {
  //         resolve: function (value) {
  //           delete callbackMap[callid];
  //           resolve(parseJavaResponse(value));
  //         },
  //         reject: function (err) {
  //           delete callbackMap[callid];
  //           reject(err);
  //         }
  //       };
  //       _resworb.invoke(name, callid, arg != null ? ('' + JSON.stringify(arg)) : JSON.stringify({}));
  //     })
  //   }

  //   function callNativeSync (name, arg) {
  //     var res = _resworb.invokeSync(name, arg);
  //     return parseJavaResponse(res);
  //   }

  //   function readFileSync (path) {
  //     return callNativeSync('readFileSync', path)
  //   }

  //   function existsSync (path) {
  //     return callNativeSync('existsSync', path)
  //   }

  //   function statSync (path) {
  //     var obj = callNativeSync('statSync', path)
  //     return new Stat(obj);
  //   }

  //   window.resworb = {
  //     callNative: callNative,
  //     callNativeSync: callNativeSync,
  //     map: callbackMap,
  //     fs: {
  //       readFileSync: readFileSync,
  //       existsSync: existsSync,
  //       statSync: statSync
  //     }
  //   };

  //   window.dispatchEvent(new Event('resworbready'));

  // })();

})));
