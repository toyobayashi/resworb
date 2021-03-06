import { CHAR_FORWARD_SLASH, nmChars, validateString } from './_constants.js';
import * as _path from '@tybys/denostd/dist/esm/std/path/mod.js';

var nmLen = nmChars.length;

var statCache = Object.create(null);

function stripBOM (content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

export function makeRequireFunction (mod, mainModule) {
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

export function createModule (builtinModules, entry) {
  builtinModules.module = Module;

  if (!builtinModules.fs) {
    throw new Error('Must implement fs.readFileSync & fs.statSync & fs.existsSync at least');
  }

  var fs = builtinModules.fs;
  if (!builtinModules.path) {
    builtinModules.path = _path;
  }
  var path = builtinModules.path;

  var modulePaths = [];
  var packageJsonCache = Object.create(null);

  var mainModule = new Module(entry || '/', null);
  mainModule.filename = entry;
  mainModule.loaded = true;

  function resolve () {
    var args = Array.prototype.slice.call(arguments);
    if (args.length > 0 && args[0].indexOf('file://') === 0) {
      args[0] = args[0].substring(7);
      return 'file://' + path.resolve.apply(undefined, args);
    }
    return path.resolve.apply(undefined, args);
  }

  function join () {
    var args = Array.prototype.slice.call(arguments);
    if (args.length > 0 && args[0].indexOf('file://') === 0) {
      args[0] = args[0].substring(7);
      return 'file://' + path.join.apply(undefined, args);
    }
    return path.join.apply(undefined, args);
  }

  function statSync (p) {
    if (statCache[p]) {
      return statCache[p];
    }
    var stat = fs.statSync(p);
    statCache[p] = stat;
    return stat;
  }

  function Module (id, parent) {
    this.id = id;
    this.filename = null;
    this.path = path.dirname(id);
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
    var moduleWrapper = new Function('exports', 'require', 'module', '__filename', '__dirname', stripBOM(content) + '\n//# sourceURL=' + filename);
    moduleWrapper.call(module.exports, module.exports, makeRequireFunction(module, mainModule), module, filename, path.dirname(filename));
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
        (true || request.charAt(1) !== '\\'))) {
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

    var parentDir = [path.dirname(parent.filename)];
    return parentDir;
  };

  Module._findPath = function _findPath (request, paths, isMain) {
    var absoluteRequest = path.isAbsolute(request) || request.indexOf('file://') === 0;
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
      var basePath = resolveExports(curPath, request, absoluteRequest);
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
          filename = tryExtensions(basePath, exts, isMain);
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
    module.paths = Module._nodeModulePaths(path.dirname(filename));
    Module._extensions[path.extname(filename)](module, filename);
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
      var filename = tryFile(p + exts[i], isMain);

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
      return tryExtensions(resolve(requestPath, 'index'), exts, isMain);
    }

    var filename = resolve(requestPath, pkg);
    var actual = tryFile(filename, isMain) ||
      tryExtensions(filename, exts, isMain) ||
      tryExtensions(resolve(filename, 'index'), exts, isMain);
    if (actual === false) {
      actual = tryExtensions(resolve(requestPath, 'index'), exts, isMain);
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
