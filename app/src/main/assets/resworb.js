(function () {
	'use strict';

	

	var nativeRequire;

	if (typeof __webpack_modules__ !== 'undefined') {
	  nativeRequire = typeof __tybys_get_native_require__ === 'function' ? __tybys_get_native_require__() : function () {
	    return typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : undefined;
	  }();
	} else {
	  nativeRequire = function () {
	    return typeof __webpack_modules__ !== 'undefined' ? typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : undefined : typeof require !== 'undefined' ? require : undefined;
	  }();
	}

	var nativeRequire_2 = nativeRequire;
	var nativeRequire_1 = {
	  nativeRequire: nativeRequire_2
	};

	var nativeRequire$1 = nativeRequire_1.nativeRequire;

	var __Buffer;

	try {
	  __Buffer = nativeRequire$1('buffer').Buffer;
	} catch (e) {// empty
	}

	var toString = Object.prototype.toString;

	function isArray(o) {
	  if (Array.isArray) {
	    return Array.isArray(o);
	  }

	  return toString.call(o) === '[object Array]';
	}

	function isArrayLike(o) {
	  return typeof Uint8Array !== 'undefined' && o instanceof Uint8Array || isArray(o);
	}

	function createBuffer(len) {
	  if (__Buffer) {
	    return __Buffer.alloc(len);
	  }

	  var i;

	  if (typeof Uint8Array !== 'undefined') {
	    return new Uint8Array(len);
	  }

	  var arr = [];

	  for (i = 0; i < len; i++) {
	    arr[i] = 0;
	  }

	  return arr;
	}

	function bufferFrom(buf) {
	  if (__Buffer) {
	    return __Buffer.from(buf);
	  }

	  var i;

	  if (typeof Uint8Array !== 'undefined') {
	    if (typeof Uint8Array.from === 'function') {
	      return Uint8Array.from(buf);
	    } else {
	      var uint8arr = new Uint8Array(buf.length);

	      for (i = 0; i < buf.length; i++) {
	        uint8arr[i] = buf[i];
	      }

	      return uint8arr;
	    }
	  }

	  var arr = [];

	  for (i = 0; i < buf.length; i++) {
	    arr[i] = buf[i];
	  }

	  return arr;
	}

	function readUInt32BE(offset) {
	  offset = offset || 0;

	  if (__Buffer && __Buffer.isBuffer(this)) {
	    return this.readUInt32BE(offset);
	  }

	  var first = this[offset];
	  var last = this[offset + 3];

	  if (first === undefined || last === undefined) {
	    throw new RangeError('Attempt to write outside buffer bounds');
	  }

	  return first * Math.pow(2, 24) + this[++offset] * Math.pow(2, 16) + this[++offset] * Math.pow(2, 8) + last;
	}

	function bufferToString(encoding) {
	  if (__Buffer) {
	    return __Buffer.from(this).toString(encoding);
	  }

	  var res = '';
	  var i = 0;

	  if (encoding === 'hex') {
	    res = '';

	    for (i = 0; i < this.length; i++) {
	      var hex = this[i].toString(16);
	      res += hex.length === 1 ? '0' + hex : hex;
	    }

	    return res;
	  } else if (encoding === 'binary') {
	    res = '';

	    for (i = 0; i < this.length; i++) {
	      res += String.fromCharCode(this[i]);
	    }

	    return res;
	  } else {
	    var out, len, c;
	    var char2, char3;
	    out = '';
	    len = this.length;
	    i = 0;

	    while (i < len) {
	      c = this[i++];

	      switch (c >> 4) {
	        case 0:
	        case 1:
	        case 2:
	        case 3:
	        case 4:
	        case 5:
	        case 6:
	        case 7:
	          // 0xxxxxxx
	          out += String.fromCharCode(c);
	          break;

	        case 12:
	        case 13:
	          // 110x xxxx 10xx xxxx
	          char2 = this[i++];
	          out += String.fromCharCode((c & 0x1F) << 6 | char2 & 0x3F);
	          break;

	        case 14:
	          // 1110 xxxx 10xx xxxx 10xx xxxx
	          char2 = this[i++];
	          char3 = this[i++];
	          out += String.fromCharCode((c & 0x0F) << 12 | (char2 & 0x3F) << 6 | (char3 & 0x3F) << 0);
	          break;
	      }
	    }

	    return out;
	  }
	}

	function insecureRandomBytes(size) {
	  var result = createBuffer(size);

	  for (var i = 0; i < size; ++i) {
	    result[i] = Math.floor(Math.random() * 256);
	  }

	  return result;
	}

	var randomBytes = insecureRandomBytes;

	if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues && typeof Uint8Array !== 'undefined') {
	  randomBytes = function randomBytes(size) {
	    return window.crypto.getRandomValues(new Uint8Array(size));
	  };
	} else {
	  var crypto;

	  try {
	    crypto = nativeRequire$1('crypto');
	    randomBytes = crypto.randomBytes;
	  } catch (e) {// keep the fallback
	  }

	  if (randomBytes == null) {
	    randomBytes = insecureRandomBytes;
	  }
	}

	function deprecate(fn, msg) {
	  return function () {
	    console.warn(msg);
	    var args = Array.prototype.slice.call(arguments);
	    return fn.apply(this, args);
	  };
	} // constants


	var PROCESS_UNIQUE = randomBytes(5); // Regular expression that checks for hex value

	var checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$'); // let hasBufferType = false;
	// Check if buffer exists
	// try {
	//   if (Buffer && Buffer.from) hasBufferType = true;
	// } catch (err) {
	//   hasBufferType = false;
	// }
	// Precomputed hex table enables speedy hex string conversion

	var hexTable = [];
	var i;

	for (i = 0; i < 256; i++) {
	  hexTable[i] = (i <= 15 ? '0' : '') + i.toString(16);
	} // Lookup tables


	var decodeLookup = [];
	i = 0;

	while (i < 10) {
	  decodeLookup[0x30 + i] = i++;
	}

	while (i < 16) {
	  decodeLookup[0x41 - 10 + i] = decodeLookup[0x61 - 10 + i] = i++;
	} // const _Buffer = Buffer;


	function convertToHex(bytes) {
	  // return bytes.toString('hex');
	  return bufferToString.call(bytes, 'hex');
	}

	function makeObjectIdError(invalidString, index) {
	  var invalidCharacter = invalidString[index];
	  return new TypeError('ObjectId string "' + invalidString + '" contains invalid character "' + invalidCharacter + '" with character code (' + invalidString.charCodeAt(index) + '). All character codes for a non-hex string must be less than 256.');
	}
	/**
	 * Create an ObjectId type
	 *
	 * @constructor
	 * @param {(string|Uint8Array|number)} id Can be a 24 byte hex string, 12 byte binary Buffer, or a Number.
	 * @property {number} generationTime The generation time of this ObjectId instance
	 * @return {ObjectId} instance of ObjectId.
	 */


	function ObjectId(id) {
	  if (!(this instanceof ObjectId)) throw new TypeError('Class constructor ObjectId cannot be invoked without \'new\''); // Duck-typing to support ObjectId from different npm packages

	  if (id instanceof ObjectId) return id; // The most common usecase (blank id, new objectId instance)

	  if (id == null || typeof id === 'number') {
	    // Generate a new id
	    this.id = ObjectId.generate(id); // If we are caching the hex string

	    if (ObjectId.cacheHexString) this.__id = this.toString('hex'); // Return the object

	    return;
	  } // Check if the passed in id is valid


	  var valid = ObjectId.isValid(id); // Throw an error if it's not a valid setup

	  if (!valid && id != null) {
	    throw new TypeError('Argument passed in must be a single String of 12 bytes or a string of 24 hex characters');
	  } else if (valid && typeof id === 'string' && id.length === 24 && __Buffer) {
	    return new ObjectId(__Buffer.from(id, 'hex'));
	  } else if (valid && typeof id === 'string' && id.length === 24) {
	    return ObjectId.createFromHexString(id);
	  } else if (id != null && id.length === 12) {
	    if (isArrayLike(id)) {
	      this.id = bufferFrom(id);
	    } else {
	      // assume 12 byte string
	      this.id = id;
	    }
	  } else if (id != null && id.toHexString) {
	    // Duck-typing to support ObjectId from different npm packages
	    return ObjectId.createFromHexString(id.toHexString());
	  } else {
	    throw new TypeError('Argument passed in must be a single String of 12 bytes or a string of 24 hex characters');
	  }

	  if (ObjectId.cacheHexString) this.__id = this.toString('hex');
	}
	/**
	 * Return the ObjectId id as a 24 byte hex string representation
	 *
	 * @method
	 * @return {string} return the 24 byte hex string representation.
	 */


	ObjectId.prototype.toHexString = function () {
	  if (ObjectId.cacheHexString && this.__id) return this.__id;
	  var hexString = '';

	  if (!this.id || !this.id.length) {
	    throw new TypeError('invalid ObjectId, ObjectId.id must be either a string or a Buffer, but is [' + JSON.stringify(this.id) + ']');
	  }

	  if (isArrayLike(this.id)) {
	    hexString = convertToHex(this.id);
	    if (ObjectId.cacheHexString) this.__id = hexString;
	    return hexString;
	  }

	  for (var i = 0; i < this.id.length; i++) {
	    var hexChar = hexTable[this.id.charCodeAt(i)];

	    if (typeof hexChar !== 'string') {
	      throw makeObjectIdError(this.id, i);
	    }

	    hexString += hexChar;
	  }

	  if (ObjectId.cacheHexString) this.__id = hexString;
	  return hexString;
	};
	/**
	 * Update the ObjectId index used in generating new ObjectId's on the driver
	 *
	 * @method
	 * @return {number} returns next index value.
	 * @ignore
	 */


	ObjectId.getInc = function () {
	  return ObjectId.index = (ObjectId.index + 1) % 0xffffff;
	};
	/**
	 * Generate a 12 byte id buffer used in ObjectId's
	 *
	 * @method
	 * @param {number} [time] optional parameter allowing to pass in a second based timestamp.
	 * @return {Uint8Array} return the 12 byte id buffer string.
	 */


	ObjectId.generate = function (time) {
	  if ('number' !== typeof time) {
	    time = ~~(Date.now() / 1000);
	  }

	  var inc = ObjectId.getInc();
	  var buffer = createBuffer(12); // 4-byte timestamp

	  buffer[3] = time & 0xff;
	  buffer[2] = time >> 8 & 0xff;
	  buffer[1] = time >> 16 & 0xff;
	  buffer[0] = time >> 24 & 0xff; // 5-byte process unique

	  buffer[4] = PROCESS_UNIQUE[0];
	  buffer[5] = PROCESS_UNIQUE[1];
	  buffer[6] = PROCESS_UNIQUE[2];
	  buffer[7] = PROCESS_UNIQUE[3];
	  buffer[8] = PROCESS_UNIQUE[4]; // 3-byte counter

	  buffer[11] = inc & 0xff;
	  buffer[10] = inc >> 8 & 0xff;
	  buffer[9] = inc >> 16 & 0xff;
	  return buffer;
	};
	/**
	 * Converts the id into a 24 byte hex string for printing
	 *
	 * @return {String} return the 24 byte hex string representation.
	 * @ignore
	 */


	ObjectId.prototype.toString = function (format) {
	  // Is the id a buffer then use the buffer toString method to return the format
	  if (isArrayLike(this.id)) {
	    // return this.id.toString(typeof format === 'string' ? format : 'hex');
	    return bufferToString.call(this.id, typeof format === 'string' ? format : 'hex');
	  }

	  return this.toHexString();
	};
	/**
	 * Converts to its JSON representation.
	 *
	 * @return {String} return the 24 byte hex string representation.
	 * @ignore
	 */


	ObjectId.prototype.toJSON = function () {
	  return this.toHexString();
	};
	/**
	 * Compares the equality of this ObjectId with `otherID`.
	 *
	 * @method
	 * @param {object} otherId ObjectId instance to compare against.
	 * @return {boolean} the result of comparing two ObjectId's
	 */


	ObjectId.prototype.equals = function (otherId) {
	  if (otherId instanceof ObjectId) {
	    return this.toString() === otherId.toString();
	  }

	  if (typeof otherId === 'string' && ObjectId.isValid(otherId) && otherId.length === 12 && isArrayLike(this.id)) {
	    // return otherId === this.id.toString('binary');
	    return otherId === bufferToString.call(this.id, 'binary');
	  }

	  if (typeof otherId === 'string' && ObjectId.isValid(otherId) && otherId.length === 24) {
	    return otherId.toLowerCase() === this.toHexString();
	  }

	  if (typeof otherId === 'string' && ObjectId.isValid(otherId) && otherId.length === 12) {
	    return otherId === this.id;
	  }

	  if (otherId != null && (otherId instanceof ObjectId || otherId.toHexString)) {
	    return otherId.toHexString() === this.toHexString();
	  }

	  return false;
	};
	/**
	 * Returns the generation date (accurate up to the second) that this ID was generated.
	 *
	 * @method
	 * @return {Date} the generation date
	 */


	ObjectId.prototype.getTimestamp = function () {
	  var timestamp = new Date();
	  var time = readUInt32BE.call(this.id, 0);
	  timestamp.setTime(Math.floor(time) * 1000);
	  return timestamp;
	};
	/**
	 * @ignore
	 */


	ObjectId.createPk = function () {
	  return new ObjectId();
	};
	/**
	 * Creates an ObjectId from a second based number, with the rest of the ObjectId zeroed out. Used for comparisons or sorting the ObjectId.
	 *
	 * @method
	 * @param {number} time an integer number representing a number of seconds.
	 * @return {ObjectId} return the created ObjectId
	 */


	ObjectId.createFromTime = function (time) {
	  var buffer = createBuffer(12); // Encode time into first 4 bytes

	  buffer[3] = time & 0xff;
	  buffer[2] = time >> 8 & 0xff;
	  buffer[1] = time >> 16 & 0xff;
	  buffer[0] = time >> 24 & 0xff; // Return the new objectId

	  return new ObjectId(buffer);
	};
	/**
	 * Creates an ObjectId from a hex string representation of an ObjectId.
	 *
	 * @method
	 * @param {string} hexString create a ObjectId from a passed in 24 byte hexstring.
	 * @return {ObjectId} return the created ObjectId
	 */


	ObjectId.createFromHexString = function (hexString) {
	  // Throw an error if it's not a valid setup
	  if (typeof hexString === 'undefined' || hexString != null && hexString.length !== 24) {
	    throw new TypeError('Argument passed in must be a single String of 12 bytes or a string of 24 hex characters');
	  } // Use Buffer.from method if available
	  // if (hasBufferType) return new ObjectId(Buffer.from(string, 'hex'));
	  // Calculate lengths


	  var array = createBuffer(12);
	  var n = 0;
	  var i = 0;

	  while (i < 24) {
	    array[n++] = decodeLookup[hexString.charCodeAt(i++)] << 4 | decodeLookup[hexString.charCodeAt(i++)];
	  }

	  return new ObjectId(array);
	};
	/**
	 * Checks if a value is a valid bson ObjectId
	 *
	 * @method
	 * @param {any} id
	 * @return {boolean} return true if the value is a valid bson ObjectId, return false otherwise.
	 */


	ObjectId.isValid = function (id) {
	  if (id == null) return false;

	  if (typeof id === 'number') {
	    return true;
	  }

	  if (typeof id === 'string') {
	    return id.length === 12 || id.length === 24 && checkForHexRegExp.test(id);
	  }

	  if (id instanceof ObjectId) {
	    return true;
	  }

	  if (isArrayLike(id) && id.length === 12) {
	    return true;
	  } // Duck-Typing detection of ObjectId like objects


	  if (id.toHexString) {
	    return id.id.length === 12 || id.id.length === 24 && checkForHexRegExp.test(id.id);
	  }

	  return false;
	};
	/**
	 * @ignore
	 */


	ObjectId.prototype.toExtendedJSON = function () {
	  if (this.toHexString) return {
	    $oid: this.toHexString()
	  };
	  return {
	    $oid: this.toString('hex')
	  };
	};
	/**
	 * @ignore
	 */


	ObjectId.fromExtendedJSON = function (doc) {
	  return new ObjectId(doc.$oid);
	}; // Deprecated methods


	ObjectId.get_inc = deprecate(function () {
	  return ObjectId.getInc();
	}, 'Please use the static `ObjectId.getInc()` instead');
	ObjectId.prototype.get_inc = deprecate(function () {
	  return ObjectId.getInc();
	}, 'Please use the static `ObjectId.getInc()` instead');
	ObjectId.prototype.getInc = deprecate(function () {
	  return ObjectId.getInc();
	}, 'Please use the static `ObjectId.getInc()` instead');
	ObjectId.prototype.generate = deprecate(function (time) {
	  return ObjectId.generate(time);
	}, 'Please use the static `ObjectId.generate(time)` instead');

	try {
	  Object.defineProperty(ObjectId.prototype, 'generationTime', {
	    enumerable: true,
	    'get': function get() {
	      return this.id[3] | this.id[2] << 8 | this.id[1] << 16 | this.id[0] << 24;
	    },
	    'set': function set(value) {
	      // Encode time into first 4 bytes
	      this.id[3] = value & 0xff;
	      this.id[2] = value >> 8 & 0xff;
	      this.id[1] = value >> 16 & 0xff;
	      this.id[0] = value >> 24 & 0xff;
	    }
	  });
	} catch (err) {
	  ObjectId.prototype.generationTime = 0;
	}

	var util;

	try {
	  util = nativeRequire$1('util');
	  ObjectId.prototype[util.inspect.custom || 'inspect'] = ObjectId.prototype.toString;
	} catch (e) {
	  ObjectId.prototype.inspect = ObjectId.prototype.toString;
	}
	/**
	 * @ignore
	 */


	ObjectId.index = ~~(Math.random() * 0xffffff); // In 4.0.0 and 4.0.1, this property name was changed to ObjectId to match the class name.
	// This caused interoperability problems with previous versions of the library, so in
	// later builds we changed it back to ObjectID (capital D) to match legacy implementations.

	try {
	  Object.defineProperty(ObjectId.prototype, '_bsontype', {
	    value: 'ObjectID'
	  });
	} catch (err) {
	  ObjectId.prototype._bsontype = 'ObjectID';
	}

	var _resworb = window.resworb;
	var callbacks = {};
	delete window.resworb;
	Object.defineProperty(window, '__resworb_callbacks__', {
	  configurable: false,
	  enumerable: false,
	  get: function get() {
	    return callbacks;
	  }
	});

	function parseJavaResponse(res) {
	  if (res === '') return undefined;
	  return JSON.parse(res);
	}

	function callNativeSync(name, arg) {
	  var res = _resworb.invokeSync(name, arg);

	  return parseJavaResponse(res);
	}

	function Stat(obj) {
	  Object.defineProperties(this, {
	    _info: {
	      configurable: false,
	      enumerable: false,
	      get: function get() {
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

	function readFileSync(p, toUtf8) {
	  var arr = callNativeSync('readFileSync', p);
	  var buffer = Buffer.from(arr);

	  if (toUtf8 === 'utf8' || toUtf8 === 'utf-8') {
	    return new TextDecoder('utf-8').decode(buffer);
	  }

	  return buffer;
	}
	function existsSync(p) {
	  return callNativeSync('existsSync', p);
	}
	function statSync(p) {
	  var obj = callNativeSync('statSync', p);
	  return new Stat(obj);
	}

	var fs = /*#__PURE__*/Object.freeze({
		__proto__: null,
		readFileSync: readFileSync,
		existsSync: existsSync,
		statSync: statSync
	});

	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	    _typeof = function (obj) {
	      return typeof obj;
	    };
	  } else {
	    _typeof = function (obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	    };
	  }

	  return _typeof(obj);
	}

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

	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
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

	function _slicedToArray(arr, i) {
	  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
	}

	function _toArray(arr) {
	  return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
	}

	function _toConsumableArray(arr) {
	  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
	}

	function _arrayWithoutHoles(arr) {
	  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
	}

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	function _iterableToArray(iter) {
	  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
	}

	function _iterableToArrayLimit(arr, i) {
	  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
	  var _arr = [];
	  var _n = true;
	  var _d = false;
	  var _e = undefined;

	  try {
	    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
	      _arr.push(_s.value);

	      if (i && _arr.length === i) break;
	    }
	  } catch (err) {
	    _d = true;
	    _e = err;
	  } finally {
	    try {
	      if (!_n && _i["return"] != null) _i["return"]();
	    } finally {
	      if (_d) throw _e;
	    }
	  }

	  return _arr;
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

	function _nonIterableSpread() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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

	var CHAR_FORWARD_SLASH = 47; // export var CHAR_BACKWARD_SLASH = 92;

	var nmChars = [115, 101, 108, 117, 100, 111, 109, 95, 101, 100, 111, 110];
	var validateString = function validateString(value, name) {
	  if (typeof value !== 'string') throw new TypeError('The "' + name + '" argument must be of type string. Received type ' + _typeof(value));
	};

	// Copyright the Browserify authors. MIT License.
	// Ported from https://github.com/browserify/path-browserify/

	/** This module is browser compatible. */
	// Alphabet chars.
	var CHAR_UPPERCASE_A = 65;
	/* A */

	var CHAR_LOWERCASE_A = 97;
	/* a */

	var CHAR_UPPERCASE_Z = 90;
	/* Z */

	var CHAR_LOWERCASE_Z = 122;
	/* z */
	// Non-alphabetic chars.

	var CHAR_DOT = 46;
	/* . */

	var CHAR_FORWARD_SLASH$1 = 47;
	/* / */

	var CHAR_BACKWARD_SLASH = 92;
	/* | */

	var CHAR_COLON = 58;
	/* : */

	var CHAR_QUESTION_MARK = 63;
	/* 9 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	var navigator$1 = globalThis.navigator;
	var isWindows = typeof process !== "undefined" && process.browser === undefined ? process.platform === "win32" : navigator$1.appVersion.includes("Win");

	// Copyright the Browserify authors. MIT License.
	function assertPath(path) {
	  if (typeof path !== "string") {
	    throw new TypeError("Path must be a string. Received ".concat(JSON.stringify(path)));
	  }
	}
	function isPosixPathSeparator(code) {
	  return code === CHAR_FORWARD_SLASH$1;
	}
	function isPathSeparator(code) {
	  return isPosixPathSeparator(code) || code === CHAR_BACKWARD_SLASH;
	}
	function isWindowsDeviceRoot(code) {
	  return code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z || code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z;
	} // Resolves . and .. elements in a path with directory names

	function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
	  var res = "";
	  var lastSegmentLength = 0;
	  var lastSlash = -1;
	  var dots = 0;
	  var code;

	  for (var i = 0, len = path.length; i <= len; ++i) {
	    if (i < len) code = path.charCodeAt(i);else if (isPathSeparator(code)) break;else code = CHAR_FORWARD_SLASH$1;

	    if (isPathSeparator(code)) {
	      if (lastSlash === i - 1 || dots === 1) ; else if (lastSlash !== i - 1 && dots === 2) {
	        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
	          if (res.length > 2) {
	            var lastSlashIndex = res.lastIndexOf(separator);

	            if (lastSlashIndex === -1) {
	              res = "";
	              lastSegmentLength = 0;
	            } else {
	              res = res.slice(0, lastSlashIndex);
	              lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
	            }

	            lastSlash = i;
	            dots = 0;
	            continue;
	          } else if (res.length === 2 || res.length === 1) {
	            res = "";
	            lastSegmentLength = 0;
	            lastSlash = i;
	            dots = 0;
	            continue;
	          }
	        }

	        if (allowAboveRoot) {
	          if (res.length > 0) res += "".concat(separator, "..");else res = "..";
	          lastSegmentLength = 2;
	        }
	      } else {
	        if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);else res = path.slice(lastSlash + 1, i);
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
	function _format(sep, pathObject) {
	  var dir = pathObject.dir || pathObject.root;
	  var base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
	  if (!dir) return base;
	  if (dir === pathObject.root) return dir + base;
	  return dir + sep + base;
	}

	// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
	var DenoStdInternalError = /*#__PURE__*/function (_Error) {
	  _inherits(DenoStdInternalError, _Error);

	  var _super = _createSuper(DenoStdInternalError);

	  function DenoStdInternalError(message) {
	    var _this;

	    _classCallCheck(this, DenoStdInternalError);

	    _this = _super.call(this, message);
	    _this.name = "DenoStdInternalError";
	    return _this;
	  }

	  return DenoStdInternalError;
	}( /*#__PURE__*/_wrapNativeSuper(Error));
	/** Make an assertion, if not `true`, then throw. */

	function assert(expr) {
	  var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

	  if (!expr) {
	    throw new DenoStdInternalError(msg);
	  }
	}

	var sep = "\\";
	var delimiter = ";";
	function resolve() {
	  var resolvedDevice = "";
	  var resolvedTail = "";
	  var resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1; i--) {
	    var path = void 0;

	    if (i >= 0) {
	      path = i < 0 || arguments.length <= i ? undefined : arguments[i];
	    } else if (!resolvedDevice) {
	      if (globalThis.Deno == null) {
	        throw new TypeError("Resolved a drive-letter-less path without a CWD.");
	      }

	      path = typeof process !== "undefined" && process.browser === undefined ? process.cwd() : "C:\\";
	    } else {
	      if (globalThis.Deno == null) {
	        throw new TypeError("Resolved a relative path without a CWD.");
	      } // Windows has the concept of drive-specific current working
	      // directories. If we've resolved a drive letter but not yet an
	      // absolute path, get cwd for that drive, or the process cwd if
	      // the drive cwd is not available. We're sure the device is not
	      // a UNC path at this points, because UNC paths are always absolute.


	      path = (typeof process !== "undefined" && process.browser === undefined ? process.env["=".concat(resolvedDevice)] : "C:\\") || (typeof process !== "undefined" && process.browser === undefined ? process.cwd() : "C:\\"); // Verify that a cwd was found and that it actually points
	      // to our drive. If not, default to the drive's root.

	      if (path === undefined || path.slice(0, 3).toLowerCase() !== "".concat(resolvedDevice.toLowerCase(), "\\")) {
	        path = "".concat(resolvedDevice, "\\");
	      }
	    }

	    assertPath(path);
	    var len = path.length; // Skip empty entries

	    if (len === 0) continue;
	    var rootEnd = 0;
	    var device = "";
	    var _isAbsolute = false;
	    var code = path.charCodeAt(0); // Try to match a root

	    if (len > 1) {
	      if (isPathSeparator(code)) {
	        // Possible UNC root
	        // If we started with a separator, we know we at least have an
	        // absolute path of some kind (UNC or otherwise)
	        _isAbsolute = true;

	        if (isPathSeparator(path.charCodeAt(1))) {
	          // Matched double path separator at beginning
	          var j = 2;
	          var last = j; // Match 1 or more non-path separators

	          for (; j < len; ++j) {
	            if (isPathSeparator(path.charCodeAt(j))) break;
	          }

	          if (j < len && j !== last) {
	            var firstPart = path.slice(last, j); // Matched!

	            last = j; // Match 1 or more path separators

	            for (; j < len; ++j) {
	              if (!isPathSeparator(path.charCodeAt(j))) break;
	            }

	            if (j < len && j !== last) {
	              // Matched!
	              last = j; // Match 1 or more non-path separators

	              for (; j < len; ++j) {
	                if (isPathSeparator(path.charCodeAt(j))) break;
	              }

	              if (j === len) {
	                // We matched a UNC root only
	                device = "\\\\".concat(firstPart, "\\").concat(path.slice(last));
	                rootEnd = j;
	              } else if (j !== last) {
	                // We matched a UNC root with leftovers
	                device = "\\\\".concat(firstPart, "\\").concat(path.slice(last, j));
	                rootEnd = j;
	              }
	            }
	          }
	        } else {
	          rootEnd = 1;
	        }
	      } else if (isWindowsDeviceRoot(code)) {
	        // Possible device root
	        if (path.charCodeAt(1) === CHAR_COLON) {
	          device = path.slice(0, 2);
	          rootEnd = 2;

	          if (len > 2) {
	            if (isPathSeparator(path.charCodeAt(2))) {
	              // Treat separator following drive name as an absolute path
	              // indicator
	              _isAbsolute = true;
	              rootEnd = 3;
	            }
	          }
	        }
	      }
	    } else if (isPathSeparator(code)) {
	      // `path` contains just a path separator
	      rootEnd = 1;
	      _isAbsolute = true;
	    }

	    if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
	      // This path points to another device so it is not applicable
	      continue;
	    }

	    if (resolvedDevice.length === 0 && device.length > 0) {
	      resolvedDevice = device;
	    }

	    if (!resolvedAbsolute) {
	      resolvedTail = "".concat(path.slice(rootEnd), "\\").concat(resolvedTail);
	      resolvedAbsolute = _isAbsolute;
	    }

	    if (resolvedAbsolute && resolvedDevice.length > 0) break;
	  } // At this point the path should be resolved to a full absolute path,
	  // but handle relative paths to be safe (might happen when process.cwd()
	  // fails)
	  // Normalize the tail path


	  resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
	  return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
	}
	function normalize(path) {
	  assertPath(path);
	  var len = path.length;
	  if (len === 0) return ".";
	  var rootEnd = 0;
	  var device;
	  var isAbsolute = false;
	  var code = path.charCodeAt(0); // Try to match a root

	  if (len > 1) {
	    if (isPathSeparator(code)) {
	      // Possible UNC root
	      // If we started with a separator, we know we at least have an absolute
	      // path of some kind (UNC or otherwise)
	      isAbsolute = true;

	      if (isPathSeparator(path.charCodeAt(1))) {
	        // Matched double path separator at beginning
	        var j = 2;
	        var last = j; // Match 1 or more non-path separators

	        for (; j < len; ++j) {
	          if (isPathSeparator(path.charCodeAt(j))) break;
	        }

	        if (j < len && j !== last) {
	          var firstPart = path.slice(last, j); // Matched!

	          last = j; // Match 1 or more path separators

	          for (; j < len; ++j) {
	            if (!isPathSeparator(path.charCodeAt(j))) break;
	          }

	          if (j < len && j !== last) {
	            // Matched!
	            last = j; // Match 1 or more non-path separators

	            for (; j < len; ++j) {
	              if (isPathSeparator(path.charCodeAt(j))) break;
	            }

	            if (j === len) {
	              // We matched a UNC root only
	              // Return the normalized version of the UNC root since there
	              // is nothing left to process
	              return "\\\\".concat(firstPart, "\\").concat(path.slice(last), "\\");
	            } else if (j !== last) {
	              // We matched a UNC root with leftovers
	              device = "\\\\".concat(firstPart, "\\").concat(path.slice(last, j));
	              rootEnd = j;
	            }
	          }
	        }
	      } else {
	        rootEnd = 1;
	      }
	    } else if (isWindowsDeviceRoot(code)) {
	      // Possible device root
	      if (path.charCodeAt(1) === CHAR_COLON) {
	        device = path.slice(0, 2);
	        rootEnd = 2;

	        if (len > 2) {
	          if (isPathSeparator(path.charCodeAt(2))) {
	            // Treat separator following drive name as an absolute path
	            // indicator
	            isAbsolute = true;
	            rootEnd = 3;
	          }
	        }
	      }
	    }
	  } else if (isPathSeparator(code)) {
	    // `path` contains just a path separator, exit early to avoid unnecessary
	    // work
	    return "\\";
	  }

	  var tail;

	  if (rootEnd < len) {
	    tail = normalizeString(path.slice(rootEnd), !isAbsolute, "\\", isPathSeparator);
	  } else {
	    tail = "";
	  }

	  if (tail.length === 0 && !isAbsolute) tail = ".";

	  if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
	    tail += "\\";
	  }

	  if (device === undefined) {
	    if (isAbsolute) {
	      if (tail.length > 0) return "\\".concat(tail);else return "\\";
	    } else if (tail.length > 0) {
	      return tail;
	    } else {
	      return "";
	    }
	  } else if (isAbsolute) {
	    if (tail.length > 0) return "".concat(device, "\\").concat(tail);else return "".concat(device, "\\");
	  } else if (tail.length > 0) {
	    return device + tail;
	  } else {
	    return device;
	  }
	}
	function isAbsolute(path) {
	  assertPath(path);
	  var len = path.length;
	  if (len === 0) return false;
	  var code = path.charCodeAt(0);

	  if (isPathSeparator(code)) {
	    return true;
	  } else if (isWindowsDeviceRoot(code)) {
	    // Possible device root
	    if (len > 2 && path.charCodeAt(1) === CHAR_COLON) {
	      if (isPathSeparator(path.charCodeAt(2))) return true;
	    }
	  }

	  return false;
	}
	function join() {
	  var pathsCount = arguments.length;
	  if (pathsCount === 0) return ".";
	  var joined;
	  var firstPart = null;

	  for (var i = 0; i < pathsCount; ++i) {
	    var path = i < 0 || arguments.length <= i ? undefined : arguments[i];
	    assertPath(path);

	    if (path.length > 0) {
	      if (joined === undefined) joined = firstPart = path;else joined += "\\".concat(path);
	    }
	  }

	  if (joined === undefined) return "."; // Make sure that the joined path doesn't start with two slashes, because
	  // normalize() will mistake it for an UNC path then.
	  //
	  // This step is skipped when it is very clear that the user actually
	  // intended to point at an UNC path. This is assumed when the first
	  // non-empty string arguments starts with exactly two slashes followed by
	  // at least one more non-slash character.
	  //
	  // Note that for normalize() to treat a path as an UNC path it needs to
	  // have at least 2 components, so we don't filter for that here.
	  // This means that the user can use join to construct UNC paths from
	  // a server name and a share name; for example:
	  //   path.join('//server', 'share') -> '\\\\server\\share\\')

	  var needsReplace = true;
	  var slashCount = 0;
	  assert(firstPart != null);

	  if (isPathSeparator(firstPart.charCodeAt(0))) {
	    ++slashCount;
	    var firstLen = firstPart.length;

	    if (firstLen > 1) {
	      if (isPathSeparator(firstPart.charCodeAt(1))) {
	        ++slashCount;

	        if (firstLen > 2) {
	          if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;else {
	            // We matched a UNC path in the first part
	            needsReplace = false;
	          }
	        }
	      }
	    }
	  }

	  if (needsReplace) {
	    // Find any more consecutive slashes we need to replace
	    for (; slashCount < joined.length; ++slashCount) {
	      if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
	    } // Replace the slashes if needed


	    if (slashCount >= 2) joined = "\\".concat(joined.slice(slashCount));
	  }

	  return normalize(joined);
	} // It will solve the relative path from `from` to `to`, for instance:
	//  from = 'C:\\orandea\\test\\aaa'
	//  to = 'C:\\orandea\\impl\\bbb'
	// The output of the function should be: '..\\..\\impl\\bbb'

	function relative(from, to) {
	  assertPath(from);
	  assertPath(to);
	  if (from === to) return "";
	  var fromOrig = resolve(from);
	  var toOrig = resolve(to);
	  if (fromOrig === toOrig) return "";
	  from = fromOrig.toLowerCase();
	  to = toOrig.toLowerCase();
	  if (from === to) return ""; // Trim any leading backslashes

	  var fromStart = 0;
	  var fromEnd = from.length;

	  for (; fromStart < fromEnd; ++fromStart) {
	    if (from.charCodeAt(fromStart) !== CHAR_BACKWARD_SLASH) break;
	  } // Trim trailing backslashes (applicable to UNC paths only)


	  for (; fromEnd - 1 > fromStart; --fromEnd) {
	    if (from.charCodeAt(fromEnd - 1) !== CHAR_BACKWARD_SLASH) break;
	  }

	  var fromLen = fromEnd - fromStart; // Trim any leading backslashes

	  var toStart = 0;
	  var toEnd = to.length;

	  for (; toStart < toEnd; ++toStart) {
	    if (to.charCodeAt(toStart) !== CHAR_BACKWARD_SLASH) break;
	  } // Trim trailing backslashes (applicable to UNC paths only)


	  for (; toEnd - 1 > toStart; --toEnd) {
	    if (to.charCodeAt(toEnd - 1) !== CHAR_BACKWARD_SLASH) break;
	  }

	  var toLen = toEnd - toStart; // Compare paths to find the longest common path from root

	  var length = fromLen < toLen ? fromLen : toLen;
	  var lastCommonSep = -1;
	  var i = 0;

	  for (; i <= length; ++i) {
	    if (i === length) {
	      if (toLen > length) {
	        if (to.charCodeAt(toStart + i) === CHAR_BACKWARD_SLASH) {
	          // We get here if `from` is the exact base path for `to`.
	          // For example: from='C:\\foo\\bar'; to='C:\\foo\\bar\\baz'
	          return toOrig.slice(toStart + i + 1);
	        } else if (i === 2) {
	          // We get here if `from` is the device root.
	          // For example: from='C:\\'; to='C:\\foo'
	          return toOrig.slice(toStart + i);
	        }
	      }

	      if (fromLen > length) {
	        if (from.charCodeAt(fromStart + i) === CHAR_BACKWARD_SLASH) {
	          // We get here if `to` is the exact base path for `from`.
	          // For example: from='C:\\foo\\bar'; to='C:\\foo'
	          lastCommonSep = i;
	        } else if (i === 2) {
	          // We get here if `to` is the device root.
	          // For example: from='C:\\foo\\bar'; to='C:\\'
	          lastCommonSep = 3;
	        }
	      }

	      break;
	    }

	    var fromCode = from.charCodeAt(fromStart + i);
	    var toCode = to.charCodeAt(toStart + i);
	    if (fromCode !== toCode) break;else if (fromCode === CHAR_BACKWARD_SLASH) lastCommonSep = i;
	  } // We found a mismatch before the first common path separator was seen, so
	  // return the original `to`.


	  if (i !== length && lastCommonSep === -1) {
	    return toOrig;
	  }

	  var out = "";
	  if (lastCommonSep === -1) lastCommonSep = 0; // Generate the relative path based on the path difference between `to` and
	  // `from`

	  for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
	    if (i === fromEnd || from.charCodeAt(i) === CHAR_BACKWARD_SLASH) {
	      if (out.length === 0) out += "..";else out += "\\..";
	    }
	  } // Lastly, append the rest of the destination (`to`) path that comes after
	  // the common path parts


	  if (out.length > 0) {
	    return out + toOrig.slice(toStart + lastCommonSep, toEnd);
	  } else {
	    toStart += lastCommonSep;
	    if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) ++toStart;
	    return toOrig.slice(toStart, toEnd);
	  }
	}
	function toNamespacedPath(path) {
	  // Note: this will *probably* throw somewhere.
	  if (typeof path !== "string") return path;
	  if (path.length === 0) return "";
	  var resolvedPath = resolve(path);

	  if (resolvedPath.length >= 3) {
	    if (resolvedPath.charCodeAt(0) === CHAR_BACKWARD_SLASH) {
	      // Possible UNC root
	      if (resolvedPath.charCodeAt(1) === CHAR_BACKWARD_SLASH) {
	        var code = resolvedPath.charCodeAt(2);

	        if (code !== CHAR_QUESTION_MARK && code !== CHAR_DOT) {
	          // Matched non-long UNC root, convert the path to a long UNC path
	          return "\\\\?\\UNC\\".concat(resolvedPath.slice(2));
	        }
	      }
	    } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
	      // Possible device root
	      if (resolvedPath.charCodeAt(1) === CHAR_COLON && resolvedPath.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
	        // Matched device root, convert the path to a long UNC path
	        return "\\\\?\\".concat(resolvedPath);
	      }
	    }
	  }

	  return path;
	}
	function dirname(path) {
	  assertPath(path);
	  var len = path.length;
	  if (len === 0) return ".";
	  var rootEnd = -1;
	  var end = -1;
	  var matchedSlash = true;
	  var offset = 0;
	  var code = path.charCodeAt(0); // Try to match a root

	  if (len > 1) {
	    if (isPathSeparator(code)) {
	      // Possible UNC root
	      rootEnd = offset = 1;

	      if (isPathSeparator(path.charCodeAt(1))) {
	        // Matched double path separator at beginning
	        var j = 2;
	        var last = j; // Match 1 or more non-path separators

	        for (; j < len; ++j) {
	          if (isPathSeparator(path.charCodeAt(j))) break;
	        }

	        if (j < len && j !== last) {
	          // Matched!
	          last = j; // Match 1 or more path separators

	          for (; j < len; ++j) {
	            if (!isPathSeparator(path.charCodeAt(j))) break;
	          }

	          if (j < len && j !== last) {
	            // Matched!
	            last = j; // Match 1 or more non-path separators

	            for (; j < len; ++j) {
	              if (isPathSeparator(path.charCodeAt(j))) break;
	            }

	            if (j === len) {
	              // We matched a UNC root only
	              return path;
	            }

	            if (j !== last) {
	              // We matched a UNC root with leftovers
	              // Offset by 1 to include the separator after the UNC root to
	              // treat it as a "normal root" on top of a (UNC) root
	              rootEnd = offset = j + 1;
	            }
	          }
	        }
	      }
	    } else if (isWindowsDeviceRoot(code)) {
	      // Possible device root
	      if (path.charCodeAt(1) === CHAR_COLON) {
	        rootEnd = offset = 2;

	        if (len > 2) {
	          if (isPathSeparator(path.charCodeAt(2))) rootEnd = offset = 3;
	        }
	      }
	    }
	  } else if (isPathSeparator(code)) {
	    // `path` contains just a path separator, exit early to avoid
	    // unnecessary work
	    return path;
	  }

	  for (var i = len - 1; i >= offset; --i) {
	    if (isPathSeparator(path.charCodeAt(i))) {
	      if (!matchedSlash) {
	        end = i;
	        break;
	      }
	    } else {
	      // We saw the first non-path separator
	      matchedSlash = false;
	    }
	  }

	  if (end === -1) {
	    if (rootEnd === -1) return ".";else end = rootEnd;
	  }

	  return path.slice(0, end);
	}
	function basename(path) {
	  var ext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

	  if (ext !== undefined && typeof ext !== "string") {
	    throw new TypeError('"ext" argument must be a string');
	  }

	  assertPath(path);
	  var start = 0;
	  var end = -1;
	  var matchedSlash = true;
	  var i; // Check for a drive letter prefix so as not to mistake the following
	  // path separator as an extra separator at the end of the path that can be
	  // disregarded

	  if (path.length >= 2) {
	    var drive = path.charCodeAt(0);

	    if (isWindowsDeviceRoot(drive)) {
	      if (path.charCodeAt(1) === CHAR_COLON) start = 2;
	    }
	  }

	  if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
	    if (ext.length === path.length && ext === path) return "";
	    var extIdx = ext.length - 1;
	    var firstNonSlashEnd = -1;

	    for (i = path.length - 1; i >= start; --i) {
	      var code = path.charCodeAt(i);

	      if (isPathSeparator(code)) {
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

	    if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
	    return path.slice(start, end);
	  } else {
	    for (i = path.length - 1; i >= start; --i) {
	      if (isPathSeparator(path.charCodeAt(i))) {
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

	    if (end === -1) return "";
	    return path.slice(start, end);
	  }
	}
	function extname(path) {
	  assertPath(path);
	  var start = 0;
	  var startDot = -1;
	  var startPart = 0;
	  var end = -1;
	  var matchedSlash = true; // Track the state of characters (if any) we see before our first dot and
	  // after any path separator we find

	  var preDotState = 0; // Check for a drive letter prefix so as not to mistake the following
	  // path separator as an extra separator at the end of the path that can be
	  // disregarded

	  if (path.length >= 2 && path.charCodeAt(1) === CHAR_COLON && isWindowsDeviceRoot(path.charCodeAt(0))) {
	    start = startPart = 2;
	  }

	  for (var i = path.length - 1; i >= start; --i) {
	    var code = path.charCodeAt(i);

	    if (isPathSeparator(code)) {
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
	      if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
	    } else if (startDot !== -1) {
	      // We saw a non-dot and non-path separator before our dot, so we should
	      // have a good chance at having a non-empty extension
	      preDotState = -1;
	    }
	  }

	  if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
	  preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
	  preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
	    return "";
	  }

	  return path.slice(startDot, end);
	}
	function format(pathObject) {
	  /* eslint-disable max-len */
	  if (pathObject === null || _typeof(pathObject) !== "object") {
	    throw new TypeError("The \"pathObject\" argument must be of type Object. Received type ".concat(_typeof(pathObject)));
	  }

	  return _format("\\", pathObject);
	}
	function parse(path) {
	  assertPath(path);
	  var ret = {
	    root: "",
	    dir: "",
	    base: "",
	    ext: "",
	    name: ""
	  };
	  var len = path.length;
	  if (len === 0) return ret;
	  var rootEnd = 0;
	  var code = path.charCodeAt(0); // Try to match a root

	  if (len > 1) {
	    if (isPathSeparator(code)) {
	      // Possible UNC root
	      rootEnd = 1;

	      if (isPathSeparator(path.charCodeAt(1))) {
	        // Matched double path separator at beginning
	        var j = 2;
	        var last = j; // Match 1 or more non-path separators

	        for (; j < len; ++j) {
	          if (isPathSeparator(path.charCodeAt(j))) break;
	        }

	        if (j < len && j !== last) {
	          // Matched!
	          last = j; // Match 1 or more path separators

	          for (; j < len; ++j) {
	            if (!isPathSeparator(path.charCodeAt(j))) break;
	          }

	          if (j < len && j !== last) {
	            // Matched!
	            last = j; // Match 1 or more non-path separators

	            for (; j < len; ++j) {
	              if (isPathSeparator(path.charCodeAt(j))) break;
	            }

	            if (j === len) {
	              // We matched a UNC root only
	              rootEnd = j;
	            } else if (j !== last) {
	              // We matched a UNC root with leftovers
	              rootEnd = j + 1;
	            }
	          }
	        }
	      }
	    } else if (isWindowsDeviceRoot(code)) {
	      // Possible device root
	      if (path.charCodeAt(1) === CHAR_COLON) {
	        rootEnd = 2;

	        if (len > 2) {
	          if (isPathSeparator(path.charCodeAt(2))) {
	            if (len === 3) {
	              // `path` contains just a drive root, exit early to avoid
	              // unnecessary work
	              ret.root = ret.dir = path;
	              return ret;
	            }

	            rootEnd = 3;
	          }
	        } else {
	          // `path` contains just a drive root, exit early to avoid
	          // unnecessary work
	          ret.root = ret.dir = path;
	          return ret;
	        }
	      }
	    }
	  } else if (isPathSeparator(code)) {
	    // `path` contains just a path separator, exit early to avoid
	    // unnecessary work
	    ret.root = ret.dir = path;
	    return ret;
	  }

	  if (rootEnd > 0) ret.root = path.slice(0, rootEnd);
	  var startDot = -1;
	  var startPart = rootEnd;
	  var end = -1;
	  var matchedSlash = true;
	  var i = path.length - 1; // Track the state of characters (if any) we see before our first dot and
	  // after any path separator we find

	  var preDotState = 0; // Get non-dir info

	  for (; i >= rootEnd; --i) {
	    code = path.charCodeAt(i);

	    if (isPathSeparator(code)) {
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
	      if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
	    } else if (startDot !== -1) {
	      // We saw a non-dot and non-path separator before our dot, so we should
	      // have a good chance at having a non-empty extension
	      preDotState = -1;
	    }
	  }

	  if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
	  preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
	  preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
	    if (end !== -1) {
	      ret.base = ret.name = path.slice(startPart, end);
	    }
	  } else {
	    ret.name = path.slice(startPart, startDot);
	    ret.base = path.slice(startPart, end);
	    ret.ext = path.slice(startDot, end);
	  } // If the directory is the root, use the entire root as the `dir` including
	  // the trailing slash if any (`C:\abc` -> `C:\`). Otherwise, strip out the
	  // trailing slash (`C:\abc\def` -> `C:\abc`).


	  if (startPart > 0 && startPart !== rootEnd) {
	    ret.dir = path.slice(0, startPart - 1);
	  } else ret.dir = ret.root;

	  return ret;
	}
	/** Converts a file URL to a path string.
	 *
	 *      fromFileUrl("file:///C:/Users/foo"); // "C:\\Users\\foo"
	 *      fromFileUrl("file:///home/foo"); // "\\home\\foo"
	 *
	 * Note that non-file URLs are treated as file URLs and irrelevant components
	 * are ignored.
	 */

	function fromFileUrl(url) {
	  return new URL(url).pathname.replace(/^\/*([A-Za-z]:)(\/|$)/, "$1/").replace(/\//g, "\\");
	}

	var _win32 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		sep: sep,
		delimiter: delimiter,
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
		fromFileUrl: fromFileUrl
	});

	var sep$1 = "/";
	var delimiter$1 = ":"; // path.resolve([from ...], to)

	function resolve$1() {
	  var resolvedPath = "";
	  var resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = void 0;
	    if (i >= 0) path = i < 0 || arguments.length <= i ? undefined : arguments[i];else {
	      if (globalThis.Deno == null) {
	        throw new TypeError("Resolved a relative path without a CWD.");
	      }

	      path = typeof process !== "undefined" && process.browser === undefined ? process.cwd() : "/";
	    }
	    assertPath(path); // Skip empty entries

	    if (path.length === 0) {
	      continue;
	    }

	    resolvedPath = "".concat(path, "/").concat(resolvedPath);
	    resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH$1;
	  } // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)
	  // Normalize the path


	  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);

	  if (resolvedAbsolute) {
	    if (resolvedPath.length > 0) return "/".concat(resolvedPath);else return "/";
	  } else if (resolvedPath.length > 0) return resolvedPath;else return ".";
	}
	function normalize$1(path) {
	  assertPath(path);
	  if (path.length === 0) return ".";
	  var isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH$1;
	  var trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH$1; // Normalize the path

	  path = normalizeString(path, !isAbsolute, "/", isPosixPathSeparator);
	  if (path.length === 0 && !isAbsolute) path = ".";
	  if (path.length > 0 && trailingSeparator) path += "/";
	  if (isAbsolute) return "/".concat(path);
	  return path;
	}
	function isAbsolute$1(path) {
	  assertPath(path);
	  return path.length > 0 && path.charCodeAt(0) === CHAR_FORWARD_SLASH$1;
	}
	function join$1() {
	  if (arguments.length === 0) return ".";
	  var joined;

	  for (var i = 0, len = arguments.length; i < len; ++i) {
	    var path = i < 0 || arguments.length <= i ? undefined : arguments[i];
	    assertPath(path);

	    if (path.length > 0) {
	      if (!joined) joined = path;else joined += "/".concat(path);
	    }
	  }

	  if (!joined) return ".";
	  return normalize$1(joined);
	}
	function relative$1(from, to) {
	  assertPath(from);
	  assertPath(to);
	  if (from === to) return "";
	  from = resolve$1(from);
	  to = resolve$1(to);
	  if (from === to) return ""; // Trim any leading backslashes

	  var fromStart = 1;
	  var fromEnd = from.length;

	  for (; fromStart < fromEnd; ++fromStart) {
	    if (from.charCodeAt(fromStart) !== CHAR_FORWARD_SLASH$1) break;
	  }

	  var fromLen = fromEnd - fromStart; // Trim any leading backslashes

	  var toStart = 1;
	  var toEnd = to.length;

	  for (; toStart < toEnd; ++toStart) {
	    if (to.charCodeAt(toStart) !== CHAR_FORWARD_SLASH$1) break;
	  }

	  var toLen = toEnd - toStart; // Compare paths to find the longest common path from root

	  var length = fromLen < toLen ? fromLen : toLen;
	  var lastCommonSep = -1;
	  var i = 0;

	  for (; i <= length; ++i) {
	    if (i === length) {
	      if (toLen > length) {
	        if (to.charCodeAt(toStart + i) === CHAR_FORWARD_SLASH$1) {
	          // We get here if `from` is the exact base path for `to`.
	          // For example: from='/foo/bar'; to='/foo/bar/baz'
	          return to.slice(toStart + i + 1);
	        } else if (i === 0) {
	          // We get here if `from` is the root
	          // For example: from='/'; to='/foo'
	          return to.slice(toStart + i);
	        }
	      } else if (fromLen > length) {
	        if (from.charCodeAt(fromStart + i) === CHAR_FORWARD_SLASH$1) {
	          // We get here if `to` is the exact base path for `from`.
	          // For example: from='/foo/bar/baz'; to='/foo/bar'
	          lastCommonSep = i;
	        } else if (i === 0) {
	          // We get here if `to` is the root.
	          // For example: from='/foo'; to='/'
	          lastCommonSep = 0;
	        }
	      }

	      break;
	    }

	    var fromCode = from.charCodeAt(fromStart + i);
	    var toCode = to.charCodeAt(toStart + i);
	    if (fromCode !== toCode) break;else if (fromCode === CHAR_FORWARD_SLASH$1) lastCommonSep = i;
	  }

	  var out = ""; // Generate the relative path based on the path difference between `to`
	  // and `from`

	  for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
	    if (i === fromEnd || from.charCodeAt(i) === CHAR_FORWARD_SLASH$1) {
	      if (out.length === 0) out += "..";else out += "/..";
	    }
	  } // Lastly, append the rest of the destination (`to`) path that comes after
	  // the common path parts


	  if (out.length > 0) return out + to.slice(toStart + lastCommonSep);else {
	    toStart += lastCommonSep;
	    if (to.charCodeAt(toStart) === CHAR_FORWARD_SLASH$1) ++toStart;
	    return to.slice(toStart);
	  }
	}
	function toNamespacedPath$1(path) {
	  // Non-op on posix systems
	  return path;
	}
	function dirname$1(path) {
	  assertPath(path);
	  if (path.length === 0) return ".";
	  var hasRoot = path.charCodeAt(0) === CHAR_FORWARD_SLASH$1;
	  var end = -1;
	  var matchedSlash = true;

	  for (var i = path.length - 1; i >= 1; --i) {
	    if (path.charCodeAt(i) === CHAR_FORWARD_SLASH$1) {
	      if (!matchedSlash) {
	        end = i;
	        break;
	      }
	    } else {
	      // We saw the first non-path separator
	      matchedSlash = false;
	    }
	  }

	  if (end === -1) return hasRoot ? "/" : ".";
	  if (hasRoot && end === 1) return "//";
	  return path.slice(0, end);
	}
	function basename$1(path) {
	  var ext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

	  if (ext !== undefined && typeof ext !== "string") {
	    throw new TypeError('"ext" argument must be a string');
	  }

	  assertPath(path);
	  var start = 0;
	  var end = -1;
	  var matchedSlash = true;
	  var i;

	  if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
	    if (ext.length === path.length && ext === path) return "";
	    var extIdx = ext.length - 1;
	    var firstNonSlashEnd = -1;

	    for (i = path.length - 1; i >= 0; --i) {
	      var code = path.charCodeAt(i);

	      if (code === CHAR_FORWARD_SLASH$1) {
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

	    if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
	    return path.slice(start, end);
	  } else {
	    for (i = path.length - 1; i >= 0; --i) {
	      if (path.charCodeAt(i) === CHAR_FORWARD_SLASH$1) {
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

	    if (end === -1) return "";
	    return path.slice(start, end);
	  }
	}
	function extname$1(path) {
	  assertPath(path);
	  var startDot = -1;
	  var startPart = 0;
	  var end = -1;
	  var matchedSlash = true; // Track the state of characters (if any) we see before our first dot and
	  // after any path separator we find

	  var preDotState = 0;

	  for (var i = path.length - 1; i >= 0; --i) {
	    var code = path.charCodeAt(i);

	    if (code === CHAR_FORWARD_SLASH$1) {
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
	      if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
	    } else if (startDot !== -1) {
	      // We saw a non-dot and non-path separator before our dot, so we should
	      // have a good chance at having a non-empty extension
	      preDotState = -1;
	    }
	  }

	  if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
	  preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
	  preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
	    return "";
	  }

	  return path.slice(startDot, end);
	}
	function format$1(pathObject) {
	  /* eslint-disable max-len */
	  if (pathObject === null || _typeof(pathObject) !== "object") {
	    throw new TypeError("The \"pathObject\" argument must be of type Object. Received type ".concat(_typeof(pathObject)));
	  }

	  return _format("/", pathObject);
	}
	function parse$1(path) {
	  assertPath(path);
	  var ret = {
	    root: "",
	    dir: "",
	    base: "",
	    ext: "",
	    name: ""
	  };
	  if (path.length === 0) return ret;
	  var isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH$1;
	  var start;

	  if (isAbsolute) {
	    ret.root = "/";
	    start = 1;
	  } else {
	    start = 0;
	  }

	  var startDot = -1;
	  var startPart = 0;
	  var end = -1;
	  var matchedSlash = true;
	  var i = path.length - 1; // Track the state of characters (if any) we see before our first dot and
	  // after any path separator we find

	  var preDotState = 0; // Get non-dir info

	  for (; i >= start; --i) {
	    var code = path.charCodeAt(i);

	    if (code === CHAR_FORWARD_SLASH$1) {
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
	      if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
	    } else if (startDot !== -1) {
	      // We saw a non-dot and non-path separator before our dot, so we should
	      // have a good chance at having a non-empty extension
	      preDotState = -1;
	    }
	  }

	  if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
	  preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
	  preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
	    if (end !== -1) {
	      if (startPart === 0 && isAbsolute) {
	        ret.base = ret.name = path.slice(1, end);
	      } else {
	        ret.base = ret.name = path.slice(startPart, end);
	      }
	    }
	  } else {
	    if (startPart === 0 && isAbsolute) {
	      ret.name = path.slice(1, startDot);
	      ret.base = path.slice(1, end);
	    } else {
	      ret.name = path.slice(startPart, startDot);
	      ret.base = path.slice(startPart, end);
	    }

	    ret.ext = path.slice(startDot, end);
	  }

	  if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = "/";
	  return ret;
	}
	/** Converts a file URL to a path string.
	 *
	 *      fromFileUrl("file:///home/foo"); // "/home/foo"
	 *
	 * Note that non-file URLs are treated as file URLs and irrelevant components
	 * are ignored.
	 */

	function fromFileUrl$1(url) {
	  return new URL(url).pathname;
	}

	var _posix = /*#__PURE__*/Object.freeze({
		__proto__: null,
		sep: sep$1,
		delimiter: delimiter$1,
		resolve: resolve$1,
		normalize: normalize$1,
		isAbsolute: isAbsolute$1,
		join: join$1,
		relative: relative$1,
		toNamespacedPath: toNamespacedPath$1,
		dirname: dirname$1,
		basename: basename$1,
		extname: extname$1,
		format: format$1,
		parse: parse$1,
		fromFileUrl: fromFileUrl$1
	});

	// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
	var SEP = isWindows ? "\\" : "/";
	var SEP_PATTERN = isWindows ? /[\\/]+/ : /\/+/;

	/** Determines the common path from a set of paths, using an optional separator,
	 * which defaults to the OS default separator.
	 *
	 *       import { common } from "https://deno.land/std/path/mod";
	 *       const p = common([
	 *         "./deno/std/path/mod.ts",
	 *         "./deno/std/fs/mod.ts",
	 *       ]);
	 *       console.log(p); // "./deno/std/"
	 *
	 */

	function common(paths) {
	  var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : SEP;

	  var _paths = _toArray(paths),
	      _paths$ = _paths[0],
	      first = _paths$ === void 0 ? "" : _paths$,
	      remaining = _paths.slice(1);

	  if (first === "" || remaining.length === 0) {
	    return first.substring(0, first.lastIndexOf(sep) + 1);
	  }

	  var parts = first.split(sep);
	  var endOfPrefix = parts.length;

	  var _iterator = _createForOfIteratorHelper(remaining),
	      _step;

	  try {
	    for (_iterator.s(); !(_step = _iterator.n()).done;) {
	      var path = _step.value;
	      var compare = path.split(sep);

	      for (var i = 0; i < endOfPrefix; i++) {
	        if (compare[i] !== parts[i]) {
	          endOfPrefix = i;
	        }
	      }

	      if (endOfPrefix === 0) {
	        return "";
	      }
	    }
	  } catch (err) {
	    _iterator.e(err);
	  } finally {
	    _iterator.f();
	  }

	  var prefix = parts.slice(0, endOfPrefix).join(sep);
	  return prefix.endsWith(sep) ? prefix : "".concat(prefix).concat(sep);
	}

	// This file is ported from globrex@0.1.2
	var SEP$1 = isWindows ? "(?:\\\\|\\/)" : "\\/";
	var SEP_ESC = isWindows ? "\\\\" : "/";
	var SEP_RAW = isWindows ? "\\" : "/";
	var GLOBSTAR = "(?:(?:[^".concat(SEP_ESC, "/]*(?:").concat(SEP_ESC, "|/|$))*)");
	var WILDCARD = "(?:[^".concat(SEP_ESC, "/]*)");
	var GLOBSTAR_SEGMENT = "((?:[^".concat(SEP_ESC, "/]*(?:").concat(SEP_ESC, "|/|$))*)");
	var WILDCARD_SEGMENT = "(?:[^".concat(SEP_ESC, "/]*)");
	/**
	 * Convert any glob pattern to a JavaScript Regexp object
	 * @param glob Glob pattern to convert
	 * @param opts Configuration object
	 * @returns Converted object with string, segments and RegExp object
	 */

	function globrex(glob) {
	  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	      _ref$extended = _ref.extended,
	      extended = _ref$extended === void 0 ? false : _ref$extended,
	      _ref$globstar = _ref.globstar,
	      globstar = _ref$globstar === void 0 ? false : _ref$globstar,
	      _ref$strict = _ref.strict,
	      strict = _ref$strict === void 0 ? false : _ref$strict,
	      _ref$filepath = _ref.filepath,
	      filepath = _ref$filepath === void 0 ? false : _ref$filepath,
	      _ref$flags = _ref.flags,
	      flags = _ref$flags === void 0 ? "" : _ref$flags;

	  var sepPattern = new RegExp("^".concat(SEP$1).concat(strict ? "" : "+", "$"));
	  var regex = "";
	  var segment = "";
	  var pathRegexStr = "";
	  var pathSegments = []; // If we are doing extended matching, this boolean is true when we are inside
	  // a group (eg {*.html,*.js}), and false otherwise.

	  var inGroup = false;
	  var inRange = false; // extglob stack. Keep track of scope

	  var ext = []; // Helper function to build string and segments

	  function add(str) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
	      split: false,
	      last: false,
	      only: ""
	    };
	    var split = options.split,
	        last = options.last,
	        only = options.only;
	    if (only !== "path") regex += str;

	    if (filepath && only !== "regex") {
	      pathRegexStr += str.match(sepPattern) ? SEP$1 : str;

	      if (split) {
	        if (last) segment += str;

	        if (segment !== "") {
	          // change it 'includes'
	          if (!flags.includes("g")) segment = "^".concat(segment, "$");
	          pathSegments.push(new RegExp(segment, flags));
	        }

	        segment = "";
	      } else {
	        segment += str;
	      }
	    }
	  }

	  var c, n;

	  for (var i = 0; i < glob.length; i++) {
	    c = glob[i];
	    n = glob[i + 1];

	    if (["\\", "$", "^", ".", "="].includes(c)) {
	      add("\\".concat(c));
	      continue;
	    }

	    if (c.match(sepPattern)) {
	      add(SEP$1, {
	        split: true
	      });
	      if (n != null && n.match(sepPattern) && !strict) regex += "?";
	      continue;
	    }

	    if (c === "(") {
	      if (ext.length) {
	        add("".concat(c, "?:"));
	        continue;
	      }

	      add("\\".concat(c));
	      continue;
	    }

	    if (c === ")") {
	      if (ext.length) {
	        add(c);
	        var type = ext.pop();

	        if (type === "@") {
	          add("{1}");
	        } else if (type === "!") {
	          add(WILDCARD);
	        } else {
	          add(type);
	        }

	        continue;
	      }

	      add("\\".concat(c));
	      continue;
	    }

	    if (c === "|") {
	      if (ext.length) {
	        add(c);
	        continue;
	      }

	      add("\\".concat(c));
	      continue;
	    }

	    if (c === "+") {
	      if (n === "(" && extended) {
	        ext.push(c);
	        continue;
	      }

	      add("\\".concat(c));
	      continue;
	    }

	    if (c === "@" && extended) {
	      if (n === "(") {
	        ext.push(c);
	        continue;
	      }
	    }

	    if (c === "!") {
	      if (extended) {
	        if (inRange) {
	          add("^");
	          continue;
	        }

	        if (n === "(") {
	          ext.push(c);
	          add("(?!");
	          i++;
	          continue;
	        }

	        add("\\".concat(c));
	        continue;
	      }

	      add("\\".concat(c));
	      continue;
	    }

	    if (c === "?") {
	      if (extended) {
	        if (n === "(") {
	          ext.push(c);
	        } else {
	          add(".");
	        }

	        continue;
	      }

	      add("\\".concat(c));
	      continue;
	    }

	    if (c === "[") {
	      if (inRange && n === ":") {
	        i++; // skip [

	        var value = "";

	        while (glob[++i] !== ":") {
	          value += glob[i];
	        }

	        if (value === "alnum") add("(?:\\w|\\d)");else if (value === "space") add("\\s");else if (value === "digit") add("\\d");
	        i++; // skip last ]

	        continue;
	      }

	      if (extended) {
	        inRange = true;
	        add(c);
	        continue;
	      }

	      add("\\".concat(c));
	      continue;
	    }

	    if (c === "]") {
	      if (extended) {
	        inRange = false;
	        add(c);
	        continue;
	      }

	      add("\\".concat(c));
	      continue;
	    }

	    if (c === "{") {
	      if (extended) {
	        inGroup = true;
	        add("(?:");
	        continue;
	      }

	      add("\\".concat(c));
	      continue;
	    }

	    if (c === "}") {
	      if (extended) {
	        inGroup = false;
	        add(")");
	        continue;
	      }

	      add("\\".concat(c));
	      continue;
	    }

	    if (c === ",") {
	      if (inGroup) {
	        add("|");
	        continue;
	      }

	      add("\\".concat(c));
	      continue;
	    }

	    if (c === "*") {
	      if (n === "(" && extended) {
	        ext.push(c);
	        continue;
	      } // Move over all consecutive "*"'s.
	      // Also store the previous and next characters


	      var prevChar = glob[i - 1];
	      var starCount = 1;

	      while (glob[i + 1] === "*") {
	        starCount++;
	        i++;
	      }

	      var nextChar = glob[i + 1];

	      if (!globstar) {
	        // globstar is disabled, so treat any number of "*" as one
	        add(".*");
	      } else {
	        // globstar is enabled, so determine if this is a globstar segment
	        var isGlobstar = starCount > 1 && // multiple "*"'s
	        // from the start of the segment
	        [SEP_RAW, "/", undefined].includes(prevChar) && // to the end of the segment
	        [SEP_RAW, "/", undefined].includes(nextChar);

	        if (isGlobstar) {
	          // it's a globstar, so match zero or more path segments
	          add(GLOBSTAR, {
	            only: "regex"
	          });
	          add(GLOBSTAR_SEGMENT, {
	            only: "path",
	            last: true,
	            split: true
	          });
	          i++; // move over the "/"
	        } else {
	          // it's not a globstar, so only match one path segment
	          add(WILDCARD, {
	            only: "regex"
	          });
	          add(WILDCARD_SEGMENT, {
	            only: "path"
	          });
	        }
	      }

	      continue;
	    }

	    add(c);
	  } // When regexp 'g' flag is specified don't
	  // constrain the regular expression with ^ & $


	  if (!flags.includes("g")) {
	    regex = "^".concat(regex, "$");
	    segment = "^".concat(segment, "$");
	    if (filepath) pathRegexStr = "^".concat(pathRegexStr, "$");
	  }

	  var result = {
	    regex: new RegExp(regex, flags)
	  }; // Push the last segment

	  if (filepath) {
	    pathSegments.push(new RegExp(segment, flags));
	    result.path = {
	      regex: new RegExp(pathRegexStr, flags),
	      segments: pathSegments,
	      globstar: new RegExp(!flags.includes("g") ? "^".concat(GLOBSTAR_SEGMENT, "$") : GLOBSTAR_SEGMENT, flags)
	    };
	  }

	  return result;
	}

	// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
	/**
	 * Generate a regex based on glob pattern and options
	 * This was meant to be using the the `fs.walk` function
	 * but can be used anywhere else.
	 * Examples:
	 *
	 *     Looking for all the `ts` files:
	 *     walkSync(".", {
	 *       match: [globToRegExp("*.ts")]
	 *     })
	 *
	 *     Looking for all the `.json` files in any subfolder:
	 *     walkSync(".", {
	 *       match: [globToRegExp(join("a", "**", "*.json"),{
	 *         flags: "g",
	 *         extended: true,
	 *         globstar: true
	 *       })]
	 *     })
	 *
	 * @param glob - Glob pattern to be used
	 * @param options - Specific options for the glob pattern
	 * @returns A RegExp for the glob pattern
	 */

	function globToRegExp(glob) {
	  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	      _ref$extended = _ref.extended,
	      extended = _ref$extended === void 0 ? false : _ref$extended,
	      _ref$globstar = _ref.globstar,
	      globstar = _ref$globstar === void 0 ? true : _ref$globstar;

	  var result = globrex(glob, {
	    extended: extended,
	    globstar: globstar,
	    strict: false,
	    filepath: true
	  });
	  assert(result.path != null);
	  return result.path.regex;
	}
	/** Test whether the given string is a glob */

	function isGlob(str) {
	  var chars = {
	    "{": "}",
	    "(": ")",
	    "[": "]"
	  };
	  /* eslint-disable-next-line max-len */

	  var regex = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;

	  if (str === "") {
	    return false;
	  }

	  var match;

	  while (match = regex.exec(str)) {
	    if (match[2]) return true;
	    var idx = match.index + match[0].length; // if an open bracket/brace/paren is escaped,
	    // set the index to the next closing character

	    var open = match[1];
	    var close = open ? chars[open] : null;

	    if (open && close) {
	      var n = str.indexOf(close, idx);

	      if (n !== -1) {
	        idx = n + 1;
	      }
	    }

	    str = str.slice(idx);
	  }

	  return false;
	}

	var path = isWindows ? _win32 : _posix;
	var win32 = _win32;
	var posix = _posix;
	var basename$2 = path.basename,
	    delimiter$2 = path.delimiter,
	    dirname$2 = path.dirname,
	    extname$2 = path.extname,
	    format$2 = path.format,
	    fromFileUrl$2 = path.fromFileUrl,
	    isAbsolute$2 = path.isAbsolute,
	    join$2 = path.join,
	    normalize$2 = path.normalize,
	    parse$2 = path.parse,
	    relative$2 = path.relative,
	    resolve$2 = path.resolve,
	    sep$2 = path.sep,
	    toNamespacedPath$2 = path.toNamespacedPath;
	/** Like normalize(), but doesn't collapse "**\/.." when `globstar` is true. */

	function normalizeGlob(glob) {
	  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	      _ref$globstar = _ref.globstar,
	      globstar = _ref$globstar === void 0 ? false : _ref$globstar;

	  if (!!glob.match(/\0/g)) {
	    throw new Error("Glob contains invalid characters: \"".concat(glob, "\""));
	  }

	  if (!globstar) {
	    return normalize$2(glob);
	  }

	  var s = SEP_PATTERN.source;
	  var badParentPattern = new RegExp("(?<=(".concat(s, "|^)\\*\\*").concat(s, ")\\.\\.(?=").concat(s, "|$)"), "g");
	  return normalize$2(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
	}
	/** Like join(), but doesn't collapse "**\/.." when `globstar` is true. */

	function joinGlobs(globs) {
	  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	      _ref2$extended = _ref2.extended,
	      extended = _ref2$extended === void 0 ? false : _ref2$extended,
	      _ref2$globstar = _ref2.globstar,
	      globstar = _ref2$globstar === void 0 ? false : _ref2$globstar;

	  if (!globstar || globs.length == 0) {
	    return join$2.apply(void 0, _toConsumableArray(globs));
	  }

	  if (globs.length === 0) return ".";
	  var joined;

	  var _iterator = _createForOfIteratorHelper(globs),
	      _step;

	  try {
	    for (_iterator.s(); !(_step = _iterator.n()).done;) {
	      var glob = _step.value;
	      var _path = glob;

	      if (_path.length > 0) {
	        if (!joined) joined = _path;else joined += "".concat(SEP).concat(_path);
	      }
	    }
	  } catch (err) {
	    _iterator.e(err);
	  } finally {
	    _iterator.f();
	  }

	  if (!joined) return ".";
	  return normalizeGlob(joined, {
	    extended: extended,
	    globstar: globstar
	  });
	}

	var path$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		win32: win32,
		posix: posix,
		basename: basename$2,
		delimiter: delimiter$2,
		dirname: dirname$2,
		extname: extname$2,
		format: format$2,
		fromFileUrl: fromFileUrl$2,
		isAbsolute: isAbsolute$2,
		join: join$2,
		normalize: normalize$2,
		parse: parse$2,
		relative: relative$2,
		resolve: resolve$2,
		sep: sep$2,
		toNamespacedPath: toNamespacedPath$2,
		SEP: SEP,
		SEP_PATTERN: SEP_PATTERN,
		normalizeGlob: normalizeGlob,
		joinGlobs: joinGlobs,
		common: common,
		globToRegExp: globToRegExp,
		isGlob: isGlob
	});

	var nmLen = nmChars.length;
	var statCache = Object.create(null);

	function stripBOM(content) {
	  if (content.charCodeAt(0) === 0xFEFF) {
	    content = content.slice(1);
	  }

	  return content;
	}

	function createModule(builtinModules, entry) {
	  builtinModules.module = Module;
	  var fs = builtinModules.fs;

	  if (!builtinModules.path) {
	    builtinModules.path = path$1;
	  }

	  var path = builtinModules.path;
	  var modulePaths = [];
	  var packageJsonCache = Object.create(null);
	  var mainModule = new Module(entry || '/', null);
	  mainModule.filename = entry;
	  mainModule.loaded = true;

	  function resolve() {
	    var args = Array.prototype.slice.call(arguments);

	    if (args.length > 0 && args[0].indexOf('file://') === 0) {
	      args[0] = args[0].substring(7);
	      return 'file://' + path.resolve.apply(undefined, args);
	    }

	    return path.resolve.apply(undefined, args);
	  }

	  function join() {
	    var args = Array.prototype.slice.call(arguments);

	    if (args.length > 0 && args[0].indexOf('file://') === 0) {
	      args[0] = args[0].substring(7);
	      return 'file://' + path.join.apply(undefined, args);
	    }

	    return path.join.apply(undefined, args);
	  }

	  function statSync(p) {
	    if (statCache[p]) {
	      return statCache[p];
	    }

	    var stat = fs.statSync(p);
	    statCache[p] = stat;
	    return stat;
	  }

	  function makeRequireFunction(mod) {
	    var Module = mod.constructor;

	    var require = function require(path) {
	      return mod.require(path);
	    };

	    function resolve(request) {
	      validateString(request, 'request');
	      return Module._resolveFilename(request, mod, false);
	    }

	    require.resolve = resolve;

	    function paths(request) {
	      validateString(request, 'request');
	      return Module._resolveLookupPaths(request, mod);
	    }

	    resolve.paths = paths;
	    require.main = mainModule;
	    require.extensions = Module._extensions;
	    require.cache = Module._cache;
	    return require;
	  }

	  function Module(id, parent) {
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
	    var content = fs.readFileSync(filename, 'utf8'); // eslint-disable-next-line no-new-func

	    var moduleWrapper = new Function('exports', 'require', 'module', '__filename', '__dirname', stripBOM(content));
	    moduleWrapper.call(module.exports, module.exports, makeRequireFunction(module), module, filename, path.dirname(filename));
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

	  Module._nodeModulePaths = function _nodeModulePaths(from) {
	    // Guarantee that 'from' is absolute.
	    from = resolve(from); // Return early not only to avoid unnecessary work, but to *avoid* returning
	    // an array of two items for a root: [ '//node_modules', '/node_modules' ]

	    if (from === '/') return ['/node_modules']; // note: this approach *only* works when the path is guaranteed
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
	    } // Append /node_modules to handle root paths.


	    paths.push('/node_modules');
	    return paths;
	  };

	  Module._resolveLookupPaths = function _resolveLookupPaths(request, parent) {
	    // Check for node modules paths.
	    // eslint-disable-next-line no-constant-condition
	    if (request.charAt(0) !== '.' || request.length > 1 && request.charAt(1) !== '.' && request.charAt(1) !== '/' && (true )) {
	      var paths = modulePaths;

	      if (parent != null && parent.paths && parent.paths.length) {
	        paths = parent.paths.concat(paths);
	      }

	      return paths.length > 0 ? paths : null;
	    } // With --eval, parent.id is not set and parent.filename is null.


	    if (!parent || !parent.id || !parent.filename) {
	      // Make require('./path/to/foo') work - normally the path is taken
	      // from realpath(__filename) but with eval there is no filename
	      var mainPaths = ['.'].concat(Module._nodeModulePaths('.'), modulePaths);
	      return mainPaths;
	    }

	    var parentDir = [path.dirname(parent.filename)];
	    return parentDir;
	  };

	  Module._findPath = function _findPath(request, paths, isMain) {
	    var absoluteRequest = path.isAbsolute(request) || request.indexOf('file://') === 0;

	    if (absoluteRequest) {
	      paths = [''];
	    } else if (!paths || paths.length === 0) {
	      return false;
	    }

	    var cacheKey = request + '\x00' + (paths.length === 1 ? paths[0] : paths.join('\x00'));
	    var entry = Module._pathCache[cacheKey];
	    if (entry) return entry;
	    var exts;
	    var trailingSlash = request.length > 0 && request.charCodeAt(request.length - 1) === CHAR_FORWARD_SLASH;

	    if (!trailingSlash) {
	      trailingSlash = /(?:^|\/)\.?\.$/.test(request);
	    } // For each path


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

	  Module._resolveFilename = function _resolveFilename(request, parent, isMain
	  /* , options */
	  ) {
	    var paths = Module._resolveLookupPaths(request, parent); // Look up the filename first, since that's the cache key.


	    var filename = Module._findPath(request, paths, isMain);

	    if (!filename) {
	      var requireStack = [];

	      for (var cursor = parent; cursor; cursor = cursor.parent) {
	        requireStack.push(cursor.filename || cursor.id);
	      }

	      var message = 'Cannot find module \'' + request + '\'';

	      if (requireStack.length > 0) {
	        message = message + '\nRequire stack:\n- ' + requireStack.join('\n- ');
	      } // eslint-disable-next-line no-restricted-syntax


	      var err = new Error(message);
	      err.code = 'MODULE_NOT_FOUND';
	      err.requireStack = requireStack;
	      throw err;
	    }

	    return filename;
	  };

	  Module.Module = Module;

	  Module.prototype.require = function require(request) {
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

	  function resolveExports(nmPath, request) {
	    if (request.indexOf('file://') === 0) {
	      return request;
	    }

	    return resolve(nmPath, request);
	  }

	  function tryFile(requestPath, isMain) {
	    if (fs.existsSync(requestPath) && statSync(requestPath).isFile()) {
	      return requestPath;
	    }

	    return false;
	  } // Given a path, check if the file exists with any of the set extensions


	  function tryExtensions(p, exts, isMain) {
	    for (var i = 0; i < exts.length; i++) {
	      var filename = tryFile(p + exts[i]);

	      if (filename) {
	        return filename;
	      }
	    }

	    return false;
	  }

	  function readPackage(requestPath) {
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

	  function readPackageMain(requestPath) {
	    var pkg = readPackage(requestPath);
	    return pkg ? pkg.main : undefined;
	  }

	  function tryPackage(requestPath, exts, isMain, originalPath) {
	    var pkg = readPackageMain(requestPath);

	    if (!pkg) {
	      return tryExtensions(resolve(requestPath, 'index'), exts);
	    }

	    var filename = resolve(requestPath, pkg);
	    var actual = tryFile(filename) || tryExtensions(filename, exts) || tryExtensions(resolve(filename, 'index'), exts);

	    if (actual === false) {
	      actual = tryExtensions(resolve(requestPath, 'index'), exts);

	      if (!actual) {
	        // eslint-disable-next-line no-restricted-syntax
	        var err = new Error('Cannot find module \'' + filename + '\'. ' + 'Please verify that the package.json has a valid "main" entry');
	        err.code = 'MODULE_NOT_FOUND';
	        err.path = resolve(requestPath, 'package.json');
	        err.requestPath = originalPath; // TODO(BridgeAR): Add the requireStack as well.

	        throw err;
	      }
	    }

	    return actual;
	  }

	  function getBuiltinModule(request) {
	    if (request in builtinModules && Object.prototype.hasOwnProperty.call(builtinModules, request)) {
	      return builtinModules[request];
	    }

	    throw new Error('Cannot find module \'' + request + '\'. ');
	  }

	  return mainModule;
	}

	function notImplemented(msg) {
	  var message = msg ? 'Not implemented: ' + msg : 'Not implemented';
	  throw new Error(message);
	}

	var resworbVersion = '0.0.0-dev';
	var versions = {
	  node: resworbVersion,
	  resworb: resworbVersion,
	  deno: '0.58.0'
	};

	function on(_event, _callback) {
	  notImplemented();
	}

	function chdir() {
	  notImplemented();
	}

	var env = callNativeSync('process_env', '');
	var process$1 = {
	  version: 'v' + versions.resworb,
	  versions: versions,
	  platform: 'android',
	  arch: function () {
	    return callNativeSync('process_arch', '');
	  }(),
	  pid: function () {
	    return callNativeSync('process_pid', '');
	  }(),
	  cwd: function cwd() {
	    return callNativeSync('process_cwd', '');
	  },
	  chdir: chdir,
	  exit: function exit(code) {
	    callNativeSync('process_exit', JSON.stringify(code || 0));
	  },
	  on: on,

	  get env() {
	    return env;
	  },

	  get argv() {
	    return [];
	  }

	};
	Object.defineProperty(process$1, Symbol.toStringTag, {
	  enumerable: false,
	  writable: true,
	  configurable: false,
	  value: 'process'
	});

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
	Object.defineProperty(globalThis, "Buffer", {
	  value: Buffer$1,
	  enumerable: false,
	  writable: true,
	  configurable: true
	});

	var buffer = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': Buffer$1,
		Buffer: Buffer$1
	});

	// TODO: implement the 'NodeJS.Timeout' and 'NodeJS.Immediate' versions of the timers.
	// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1163ead296d84e7a3c80d71e7c81ecbd1a130e9a/types/node/v12/globals.d.ts#L1120-L1131
	var setTimeout = globalThis.setTimeout;
	var clearTimeout = globalThis.clearTimeout;
	var setInterval = globalThis.setInterval;
	var clearInterval = globalThis.clearInterval;
	var setImmediate = function setImmediate( // eslint-disable-next-line @typescript-eslint/no-explicit-any
	cb) {
	  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }

	  return globalThis.setTimeout.apply(globalThis, [cb, 0].concat(args));
	};
	var clearImmediate = globalThis.clearTimeout;

	var timers = /*#__PURE__*/Object.freeze({
		__proto__: null,
		setTimeout: setTimeout,
		clearTimeout: clearTimeout,
		setInterval: setInterval,
		clearInterval: clearInterval,
		setImmediate: setImmediate,
		clearImmediate: clearImmediate
	});

	// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
	//
	// Adapted from Node.js. Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	// In addition to being accessible through util.promisify.custom,
	// this symbol is registered globally and can be accessed in any environment as Symbol.for('nodejs.util.promisify.custom')
	var kCustomPromisifiedSymbol = Symbol["for"]("nodejs.util.promisify.custom"); // This is an internal Node symbol used by functions returning multiple arguments
	// e.g. ['bytesRead', 'buffer'] for fs.read.

	var kCustomPromisifyArgsSymbol = Symbol["for"]("deno.nodejs.util.promisify.customArgs");

	var NodeInvalidArgTypeError = /*#__PURE__*/function (_TypeError) {
	  _inherits(NodeInvalidArgTypeError, _TypeError);

	  var _super = _createSuper(NodeInvalidArgTypeError);

	  function NodeInvalidArgTypeError(argumentName, type, received) {
	    var _this;

	    _classCallCheck(this, NodeInvalidArgTypeError);

	    _this = _super.call(this, "The \"".concat(argumentName, "\" argument must be of type ").concat(type, ". Received ").concat(_typeof(received)));
	    _this.code = "ERR_INVALID_ARG_TYPE";
	    return _this;
	  }

	  return NodeInvalidArgTypeError;
	}( /*#__PURE__*/_wrapNativeSuper(TypeError));

	function promisify(original) {
	  if (typeof original !== "function") throw new NodeInvalidArgTypeError("original", "Function", original); // @ts-ignore TypeScript (as of 3.7) does not support indexing namespaces by symbol

	  if (original[kCustomPromisifiedSymbol]) {
	    // @ts-ignore TypeScript (as of 3.7) does not support indexing namespaces by symbol
	    var _fn = original[kCustomPromisifiedSymbol];

	    if (typeof _fn !== "function") {
	      throw new NodeInvalidArgTypeError("util.promisify.custom", "Function", _fn);
	    }

	    return Object.defineProperty(_fn, kCustomPromisifiedSymbol, {
	      value: _fn,
	      enumerable: false,
	      writable: false,
	      configurable: true
	    });
	  } // Names to create an object from in case the callback receives multiple
	  // arguments, e.g. ['bytesRead', 'buffer'] for fs.read.
	  // @ts-ignore TypeScript (as of 3.7) does not support indexing namespaces by symbol


	  var argumentNames = original[kCustomPromisifyArgsSymbol];

	  function fn() {
	    var _this2 = this;

	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return new Promise(function (resolve, reject) {
	      // @ts-ignore: 'this' implicitly has type 'any' because it does not have a type annotation
	      original.call.apply(original, [_this2].concat(args, [function (err) {
	        if (err) {
	          return reject(err);
	        }

	        if (argumentNames !== undefined && (arguments.length <= 1 ? 0 : arguments.length - 1) > 1) {
	          var obj = {};

	          for (var i = 0; i < argumentNames.length; i++) {
	            // @ts-ignore TypeScript
	            obj[argumentNames[i]] = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];
	          }

	          resolve(obj);
	        } else {
	          resolve(arguments.length <= 1 ? undefined : arguments[1]);
	        }
	      }]));
	    });
	  }

	  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));
	  Object.defineProperty(fn, kCustomPromisifiedSymbol, {
	    value: fn,
	    enumerable: false,
	    writable: false,
	    configurable: true
	  });
	  return Object.defineProperties(fn, Object.getOwnPropertyDescriptors(original));
	}
	promisify.custom = kCustomPromisifiedSymbol;

	// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
	//
	// Adapted from Node.js. Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	// These are simplified versions of the "real" errors in Node.
	var NodeFalsyValueRejectionError = /*#__PURE__*/function (_Error) {
	  _inherits(NodeFalsyValueRejectionError, _Error);

	  var _super = _createSuper(NodeFalsyValueRejectionError);

	  function NodeFalsyValueRejectionError(reason) {
	    var _this;

	    _classCallCheck(this, NodeFalsyValueRejectionError);

	    _this = _super.call(this, "Promise was rejected with falsy value");
	    _this.code = "ERR_FALSY_VALUE_REJECTION";
	    _this.reason = reason;
	    return _this;
	  }

	  return NodeFalsyValueRejectionError;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var NodeInvalidArgTypeError$1 = /*#__PURE__*/function (_TypeError) {
	  _inherits(NodeInvalidArgTypeError, _TypeError);

	  var _super2 = _createSuper(NodeInvalidArgTypeError);

	  function NodeInvalidArgTypeError(argumentName) {
	    var _this2;

	    _classCallCheck(this, NodeInvalidArgTypeError);

	    _this2 = _super2.call(this, "The ".concat(argumentName, " argument must be of type function."));
	    _this2.code = "ERR_INVALID_ARG_TYPE";
	    return _this2;
	  }

	  return NodeInvalidArgTypeError;
	}( /*#__PURE__*/_wrapNativeSuper(TypeError)); // eslint-disable-next-line @typescript-eslint/no-explicit-any


	function callbackify(original) {
	  if (typeof original !== "function") {
	    throw new NodeInvalidArgTypeError$1('"original"');
	  }

	  var callbackified = function callbackified() {
	    var _this3 = this;

	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    var maybeCb = args.pop();

	    if (typeof maybeCb !== "function") {
	      throw new NodeInvalidArgTypeError$1("last");
	    }

	    var cb = function cb() {
	      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	        args[_key2] = arguments[_key2];
	      }

	      maybeCb.apply(_this3, args);
	    };

	    original.apply(this, args).then(function (ret) {
	      queueMicrotask(cb.bind(_this3, null, ret));
	    }, function (rej) {
	      rej = rej || new NodeFalsyValueRejectionError(rej);
	      queueMicrotask(cb.bind(_this3, rej));
	    });
	  };

	  var descriptors = Object.getOwnPropertyDescriptors(original); // It is possible to manipulate a functions `length` or `name` property. This
	  // guards against the manipulation.

	  if (typeof descriptors.length.value === "number") {
	    descriptors.length.value++;
	  }

	  if (typeof descriptors.name.value === "string") {
	    descriptors.name.value += "Callbackified";
	  }

	  Object.defineProperties(callbackified, descriptors);
	  return callbackified;
	}

	// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
	//
	// Adapted from Node.js. Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	var _toString = Object.prototype.toString;

	var _isObjectLike = function _isObjectLike(value) {
	  return value !== null && _typeof(value) === "object";
	};

	var _isFunctionLike = function _isFunctionLike(value) {
	  return value !== null && typeof value === "function";
	};

	function isAnyArrayBuffer(value) {
	  return _isObjectLike(value) && (_toString.call(value) === "[object ArrayBuffer]" || _toString.call(value) === "[object SharedArrayBuffer]");
	}
	function isArrayBufferView(value) {
	  return ArrayBuffer.isView(value);
	}
	function isArgumentsObject(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Arguments]";
	}
	function isArrayBuffer(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object ArrayBuffer]";
	}
	function isAsyncFunction(value) {
	  return _isFunctionLike(value) && _toString.call(value) === "[object AsyncFunction]";
	}
	function isBigInt64Array(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object BigInt64Array]";
	}
	function isBigUint64Array(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object BigUint64Array]";
	}
	function isBooleanObject(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Boolean]";
	}
	function isBoxedPrimitive(value) {
	  return isBooleanObject(value) || isStringObject(value) || isNumberObject(value) || isSymbolObject(value) || isBigIntObject(value);
	}
	function isDataView(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object DataView]";
	}
	function isDate(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Date]";
	} // isExternal: Not implemented

	function isFloat32Array(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Float32Array]";
	}
	function isFloat64Array(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Float64Array]";
	}
	function isGeneratorFunction(value) {
	  return _isFunctionLike(value) && _toString.call(value) === "[object GeneratorFunction]";
	}
	function isGeneratorObject(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Generator]";
	}
	function isInt8Array(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Int8Array]";
	}
	function isInt16Array(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Int16Array]";
	}
	function isInt32Array(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Int32Array]";
	}
	function isMap(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Map]";
	}
	function isMapIterator(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Map Iterator]";
	}
	function isModuleNamespaceObject(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Module]";
	}
	function isNativeError(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Error]";
	}
	function isNumberObject(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Number]";
	}
	function isBigIntObject(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object BigInt]";
	}
	function isPromise(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Promise]";
	}
	function isRegExp(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object RegExp]";
	}
	function isSet(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Set]";
	}
	function isSetIterator(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Set Iterator]";
	}
	function isSharedArrayBuffer(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object SharedArrayBuffer]";
	}
	function isStringObject(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object String]";
	}
	function isSymbolObject(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Symbol]";
	} // Adapted from Lodash

	function isTypedArray(value) {
	  /** Used to match `toStringTag` values of typed arrays. */
	  var reTypedTag = /^\[object (?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)Array\]$/;
	  return _isObjectLike(value) && reTypedTag.test(_toString.call(value));
	}
	function isUint8Array(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Uint8Array]";
	}
	function isUint8ClampedArray(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Uint8ClampedArray]";
	}
	function isUint16Array(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Uint16Array]";
	}
	function isUint32Array(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object Uint32Array]";
	}
	function isWeakMap(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object WeakMap]";
	}
	function isWeakSet(value) {
	  return _isObjectLike(value) && _toString.call(value) === "[object WeakSet]";
	}

	var _util_types = /*#__PURE__*/Object.freeze({
		__proto__: null,
		isAnyArrayBuffer: isAnyArrayBuffer,
		isArrayBufferView: isArrayBufferView,
		isArgumentsObject: isArgumentsObject,
		isArrayBuffer: isArrayBuffer,
		isAsyncFunction: isAsyncFunction,
		isBigInt64Array: isBigInt64Array,
		isBigUint64Array: isBigUint64Array,
		isBooleanObject: isBooleanObject,
		isBoxedPrimitive: isBoxedPrimitive,
		isDataView: isDataView,
		isDate: isDate,
		isFloat32Array: isFloat32Array,
		isFloat64Array: isFloat64Array,
		isGeneratorFunction: isGeneratorFunction,
		isGeneratorObject: isGeneratorObject,
		isInt8Array: isInt8Array,
		isInt16Array: isInt16Array,
		isInt32Array: isInt32Array,
		isMap: isMap,
		isMapIterator: isMapIterator,
		isModuleNamespaceObject: isModuleNamespaceObject,
		isNativeError: isNativeError,
		isNumberObject: isNumberObject,
		isBigIntObject: isBigIntObject,
		isPromise: isPromise,
		isRegExp: isRegExp,
		isSet: isSet,
		isSetIterator: isSetIterator,
		isSharedArrayBuffer: isSharedArrayBuffer,
		isStringObject: isStringObject,
		isSymbolObject: isSymbolObject,
		isTypedArray: isTypedArray,
		isUint8Array: isUint8Array,
		isUint8ClampedArray: isUint8ClampedArray,
		isUint16Array: isUint16Array,
		isUint32Array: isUint32Array,
		isWeakMap: isWeakMap,
		isWeakSet: isWeakSet
	});

	var _TextDecoder = TextDecoder;
	var _TextEncoder = TextEncoder;

	function isArray$1(value) {
	  return Array.isArray(value);
	}
	function isBoolean(value) {
	  return typeof value === "boolean" || value instanceof Boolean;
	}
	function isNull(value) {
	  return value === null;
	}
	function isNullOrUndefined(value) {
	  return value === null || value === undefined;
	}
	function isNumber(value) {
	  return typeof value === "number" || value instanceof Number;
	}
	function isString(value) {
	  return typeof value === "string" || value instanceof String;
	}
	function isSymbol(value) {
	  return _typeof(value) === "symbol";
	}
	function isUndefined(value) {
	  return value === undefined;
	}
	function isObject(value) {
	  return value !== null && _typeof(value) === "object";
	}
	function isError(e) {
	  return e instanceof Error;
	}
	function isFunction(value) {
	  return typeof value === "function";
	}
	function isRegExp$1(value) {
	  return value instanceof RegExp;
	}
	function isPrimitive(value) {
	  return value === null || _typeof(value) !== "object" && typeof value !== "function";
	}
	function validateIntegerRange(value, name) {
	  var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -2147483648;
	  var max = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2147483647;

	  // The defaults for min and max correspond to the limits of 32-bit integers.
	  if (!Number.isInteger(value)) {
	    throw new Error("".concat(name, " must be 'an integer' but was ").concat(value));
	  }

	  if (value < min || value > max) {
	    throw new Error("".concat(name, " must be >= ").concat(min, " && <= ").concat(max, ".  Value was ").concat(value));
	  }
	}
	var TextDecoder$1 = _TextDecoder;
	var TextEncoder$1 = _TextEncoder;

	var util$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		types: _util_types,
		isArray: isArray$1,
		isBoolean: isBoolean,
		isNull: isNull,
		isNullOrUndefined: isNullOrUndefined,
		isNumber: isNumber,
		isString: isString,
		isSymbol: isSymbol,
		isUndefined: isUndefined,
		isObject: isObject,
		isError: isError,
		isFunction: isFunction,
		isRegExp: isRegExp$1,
		isPrimitive: isPrimitive,
		validateIntegerRange: validateIntegerRange,
		TextDecoder: TextDecoder$1,
		TextEncoder: TextEncoder$1,
		promisify: promisify,
		callbackify: callbackify
	});

	/**
	 * See also https://nodejs.org/api/events.html
	 */

	var EventEmitter = /*#__PURE__*/function () {
	  function EventEmitter() {
	    _classCallCheck(this, EventEmitter);

	    this._events = new Map();
	  }

	  _createClass(EventEmitter, [{
	    key: "_addListener",
	    value: function _addListener(eventName, listener, prepend) {
	      this.emit("newListener", eventName, listener);

	      if (this._events.has(eventName)) {
	        var listeners = this._events.get(eventName);

	        if (prepend) {
	          listeners.unshift(listener);
	        } else {
	          listeners.push(listener);
	        }
	      } else {
	        this._events.set(eventName, [listener]);
	      }

	      var max = this.getMaxListeners();

	      if (max > 0 && this.listenerCount(eventName) > max) {
	        var warning = new Error("Possible EventEmitter memory leak detected.\n         ".concat(this.listenerCount(eventName), " ").concat(eventName.toString(), " listeners.\n         Use emitter.setMaxListeners() to increase limit"));
	        warning.name = "MaxListenersExceededWarning";
	        console.warn(warning);
	      }

	      return this;
	    }
	    /** Alias for emitter.on(eventName, listener). */

	  }, {
	    key: "addListener",
	    value: function addListener(eventName, listener) {
	      return this._addListener(eventName, listener, false);
	    }
	    /**
	     * Synchronously calls each of the listeners registered for the event named
	     * eventName, in the order they were registered, passing the supplied
	     * arguments to each.
	     * @return true if the event had listeners, false otherwise
	     */
	    // eslint-disable-next-line @typescript-eslint/no-explicit-any

	  }, {
	    key: "emit",
	    value: function emit(eventName) {
	      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	      }

	      if (this._events.has(eventName)) {
	        if (eventName === "error" && this._events.get(EventEmitter.errorMonitor)) {
	          this.emit.apply(this, [EventEmitter.errorMonitor].concat(args));
	        }

	        var listeners = this._events.get(eventName).slice(); // We copy with slice() so array is not mutated during emit


	        var _iterator = _createForOfIteratorHelper(listeners),
	            _step;

	        try {
	          for (_iterator.s(); !(_step = _iterator.n()).done;) {
	            var listener = _step.value;

	            try {
	              listener.apply(this, args);
	            } catch (err) {
	              this.emit("error", err);
	            }
	          }
	        } catch (err) {
	          _iterator.e(err);
	        } finally {
	          _iterator.f();
	        }

	        return true;
	      } else if (eventName === "error") {
	        if (this._events.get(EventEmitter.errorMonitor)) {
	          this.emit.apply(this, [EventEmitter.errorMonitor].concat(args));
	        }

	        var errMsg = args.length > 0 ? args[0] : Error("Unhandled error.");
	        throw errMsg;
	      }

	      return false;
	    }
	    /**
	     * Returns an array listing the events for which the emitter has
	     * registered listeners.
	     */

	  }, {
	    key: "eventNames",
	    value: function eventNames() {
	      return Array.from(this._events.keys());
	    }
	    /**
	     * Returns the current max listener value for the EventEmitter which is
	     * either set by emitter.setMaxListeners(n) or defaults to
	     * EventEmitter.defaultMaxListeners.
	     */

	  }, {
	    key: "getMaxListeners",
	    value: function getMaxListeners() {
	      return this.maxListeners || EventEmitter.defaultMaxListeners;
	    }
	    /**
	     * Returns the number of listeners listening to the event named
	     * eventName.
	     */

	  }, {
	    key: "listenerCount",
	    value: function listenerCount(eventName) {
	      if (this._events.has(eventName)) {
	        return this._events.get(eventName).length;
	      } else {
	        return 0;
	      }
	    }
	  }, {
	    key: "_listeners",
	    value: function _listeners(target, eventName, unwrap) {
	      if (!target._events.has(eventName)) {
	        return [];
	      }

	      var eventListeners = target._events.get(eventName);

	      return unwrap ? this.unwrapListeners(eventListeners) : eventListeners.slice(0);
	    }
	  }, {
	    key: "unwrapListeners",
	    value: function unwrapListeners(arr) {
	      var unwrappedListeners = new Array(arr.length);

	      for (var i = 0; i < arr.length; i++) {
	        // eslint-disable-next-line @typescript-eslint/no-explicit-any
	        unwrappedListeners[i] = arr[i]["listener"] || arr[i];
	      }

	      return unwrappedListeners;
	    }
	    /** Returns a copy of the array of listeners for the event named eventName.*/

	  }, {
	    key: "listeners",
	    value: function listeners(eventName) {
	      return this._listeners(this, eventName, true);
	    }
	    /**
	     * Returns a copy of the array of listeners for the event named eventName,
	     * including any wrappers (such as those created by .once()).
	     */

	  }, {
	    key: "rawListeners",
	    value: function rawListeners(eventName) {
	      return this._listeners(this, eventName, false);
	    }
	    /** Alias for emitter.removeListener(). */

	  }, {
	    key: "off",
	    value: function off(eventName, listener) {
	      return this.removeListener(eventName, listener);
	    }
	    /**
	     * Adds the listener function to the end of the listeners array for the event
	     *  named eventName. No checks are made to see if the listener has already
	     * been added. Multiple calls passing the same combination of eventName and
	     * listener will result in the listener being added, and called, multiple
	     * times.
	     */

	  }, {
	    key: "on",
	    value: function on(eventName, listener) {
	      return this.addListener(eventName, listener);
	    }
	    /**
	     * Adds a one-time listener function for the event named eventName. The next
	     * time eventName is triggered, this listener is removed and then invoked.
	     */

	  }, {
	    key: "once",
	    value: function once(eventName, listener) {
	      var wrapped = this.onceWrap(eventName, listener);
	      this.on(eventName, wrapped);
	      return this;
	    } // Wrapped function that calls EventEmitter.removeListener(eventName, self) on execution.

	  }, {
	    key: "onceWrap",
	    value: function onceWrap(eventName, listener) {
	      var wrapper = function wrapper() {
	        this.context.removeListener(this.eventName, this.rawListener);

	        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	          args[_key2] = arguments[_key2];
	        }

	        this.listener.apply(this.context, args);
	      };

	      var wrapperContext = {
	        eventName: eventName,
	        listener: listener,
	        rawListener: wrapper,
	        context: this
	      };
	      var wrapped = wrapper.bind(wrapperContext);
	      wrapperContext.rawListener = wrapped;
	      wrapped.listener = listener;
	      return wrapped;
	    }
	    /**
	     * Adds the listener function to the beginning of the listeners array for the
	     *  event named eventName. No checks are made to see if the listener has
	     * already been added. Multiple calls passing the same combination of
	     * eventName and listener will result in the listener being added, and
	     * called, multiple times.
	     */

	  }, {
	    key: "prependListener",
	    value: function prependListener(eventName, listener) {
	      return this._addListener(eventName, listener, true);
	    }
	    /**
	     * Adds a one-time listener function for the event named eventName to the
	     * beginning of the listeners array. The next time eventName is triggered,
	     * this listener is removed, and then invoked.
	     */

	  }, {
	    key: "prependOnceListener",
	    value: function prependOnceListener(eventName, listener) {
	      var wrapped = this.onceWrap(eventName, listener);
	      this.prependListener(eventName, wrapped);
	      return this;
	    }
	    /** Removes all listeners, or those of the specified eventName. */

	  }, {
	    key: "removeAllListeners",
	    value: function removeAllListeners(eventName) {
	      var _this = this;

	      if (this._events === undefined) {
	        return this;
	      }

	      if (eventName) {
	        if (this._events.has(eventName)) {
	          var listeners = this._events.get(eventName).slice(); // Create a copy; We use it AFTER it's deleted.


	          this._events["delete"](eventName);

	          var _iterator2 = _createForOfIteratorHelper(listeners),
	              _step2;

	          try {
	            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	              var listener = _step2.value;
	              this.emit("removeListener", eventName, listener);
	            }
	          } catch (err) {
	            _iterator2.e(err);
	          } finally {
	            _iterator2.f();
	          }
	        }
	      } else {
	        var eventList = this.eventNames();
	        eventList.map(function (value) {
	          _this.removeAllListeners(value);
	        });
	      }

	      return this;
	    }
	    /**
	     * Removes the specified listener from the listener array for the event
	     * named eventName.
	     */

	  }, {
	    key: "removeListener",
	    value: function removeListener(eventName, listener) {
	      if (this._events.has(eventName)) {
	        var arr = this._events.get(eventName);

	        assert(arr);
	        var listenerIndex = -1;

	        for (var i = arr.length - 1; i >= 0; i--) {
	          // arr[i]["listener"] is the reference to the listener inside a bound 'once' wrapper
	          if (arr[i] == listener || arr[i] && arr[i]["listener"] == listener) {
	            listenerIndex = i;
	            break;
	          }
	        }

	        if (listenerIndex >= 0) {
	          arr.splice(listenerIndex, 1);
	          this.emit("removeListener", eventName, listener);

	          if (arr.length === 0) {
	            this._events["delete"](eventName);
	          }
	        }
	      }

	      return this;
	    }
	    /**
	     * By default EventEmitters will print a warning if more than 10 listeners
	     * are added for a particular event. This is a useful default that helps
	     * finding memory leaks. Obviously, not all events should be limited to just
	     * 10 listeners. The emitter.setMaxListeners() method allows the limit to be
	     * modified for this specific EventEmitter instance. The value can be set to
	     * Infinity (or 0) to indicate an unlimited number of listeners.
	     */

	  }, {
	    key: "setMaxListeners",
	    value: function setMaxListeners(n) {
	      validateIntegerRange(n, "maxListeners", 0);
	      this.maxListeners = n;
	      return this;
	    }
	  }]);

	  return EventEmitter;
	}();
	EventEmitter.defaultMaxListeners = 10;
	EventEmitter.errorMonitor = Symbol("events.errorMonitor");
	/**
	 * Creates a Promise that is fulfilled when the EventEmitter emits the given
	 * event or that is rejected when the EventEmitter emits 'error'. The Promise
	 * will resolve with an array of all the arguments emitted to the given event.
	 */

	function once(emitter, name // eslint-disable-next-line @typescript-eslint/no-explicit-any
	) {
	  return new Promise(function (resolve, reject) {
	    if (emitter instanceof EventTarget) {
	      // EventTarget does not have `error` event semantics like Node
	      // EventEmitters, we do not listen to `error` events here.
	      emitter.addEventListener(name, function () {
	        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	          args[_key3] = arguments[_key3];
	        }

	        resolve(args);
	      }, {
	        once: true,
	        passive: false,
	        capture: false
	      });
	      return;
	    } else if (emitter instanceof EventEmitter) {
	      // eslint-disable-next-line @typescript-eslint/no-explicit-any
	      var eventListener = function eventListener() {
	        if (errorListener !== undefined) {
	          emitter.removeListener("error", errorListener);
	        }

	        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
	          args[_key4] = arguments[_key4];
	        }

	        resolve(args);
	      };

	      var errorListener; // Adding an error listener is not optional because
	      // if an error is thrown on an event emitter we cannot
	      // guarantee that the actual event we are waiting will
	      // be fired. The result could be a silent way to create
	      // memory or file descriptor leaks, which is something
	      // we should avoid.

	      if (name !== "error") {
	        // eslint-disable-next-line @typescript-eslint/no-explicit-any
	        errorListener = function errorListener(err) {
	          emitter.removeListener(name, eventListener);
	          reject(err);
	        };

	        emitter.once("error", errorListener);
	      }

	      emitter.once(name, eventListener);
	      return;
	    }
	  });
	} // eslint-disable-next-line @typescript-eslint/no-explicit-any

	function createIterResult(value, done) {
	  return {
	    value: value,
	    done: done
	  };
	}
	/**
	 * Returns an AsyncIterator that iterates eventName events. It will throw if
	 * the EventEmitter emits 'error'. It removes all listeners when exiting the
	 * loop. The value returned by each iteration is an array composed of the
	 * emitted event arguments.
	 */


	function on$1(emitter, event) {
	  // eslint-disable-next-line @typescript-eslint/no-explicit-any
	  var unconsumedEventValues = []; // eslint-disable-next-line @typescript-eslint/no-explicit-any

	  var unconsumedPromises = [];
	  var error = null;
	  var finished = false;

	  var iterator = _defineProperty({
	    // eslint-disable-next-line @typescript-eslint/no-explicit-any
	    next: function next() {
	      // First, we consume all unread events
	      // eslint-disable-next-line @typescript-eslint/no-explicit-any
	      var value = unconsumedEventValues.shift();

	      if (value) {
	        return Promise.resolve(createIterResult(value, false));
	      } // Then we error, if an error happened
	      // This happens one time if at all, because after 'error'
	      // we stop listening


	      if (error) {
	        var p = Promise.reject(error); // Only the first element errors

	        error = null;
	        return p;
	      } // If the iterator is finished, resolve to done


	      if (finished) {
	        return Promise.resolve(createIterResult(undefined, true));
	      } // Wait until an event happens


	      return new Promise(function (resolve, reject) {
	        unconsumedPromises.push({
	          resolve: resolve,
	          reject: reject
	        });
	      });
	    },
	    // eslint-disable-next-line @typescript-eslint/no-explicit-any
	    "return": function _return() {
	      emitter.removeListener(event, eventHandler);
	      emitter.removeListener("error", errorHandler);
	      finished = true;

	      var _iterator3 = _createForOfIteratorHelper(unconsumedPromises),
	          _step3;

	      try {
	        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	          var promise = _step3.value;
	          promise.resolve(createIterResult(undefined, true));
	        }
	      } catch (err) {
	        _iterator3.e(err);
	      } finally {
	        _iterator3.f();
	      }

	      return Promise.resolve(createIterResult(undefined, true));
	    },
	    "throw": function _throw(err) {
	      error = err;
	      emitter.removeListener(event, eventHandler);
	      emitter.removeListener("error", errorHandler);
	    }
	  }, Symbol.asyncIterator, function () {
	    return this;
	  });

	  emitter.on(event, eventHandler);
	  emitter.on("error", errorHandler);
	  return iterator; // eslint-disable-next-line @typescript-eslint/no-explicit-any

	  function eventHandler() {
	    var promise = unconsumedPromises.shift();

	    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
	      args[_key5] = arguments[_key5];
	    }

	    if (promise) {
	      promise.resolve(createIterResult(args, false));
	    } else {
	      unconsumedEventValues.push(args);
	    }
	  } // eslint-disable-next-line @typescript-eslint/no-explicit-any


	  function errorHandler(err) {
	    finished = true;
	    var toError = unconsumedPromises.shift();

	    if (toError) {
	      toError.reject(err);
	    } else {
	      // The next time we call next()
	      error = err;
	    }

	    iterator["return"]();
	  }
	}

	var events = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': EventEmitter,
		EventEmitter: EventEmitter,
		once: once,
		on: on$1
	});

	// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
	// @internal
	function isTypedArray$1(x) {
	  return ArrayBuffer.isView(x) && !(x instanceof DataView);
	} // @internal

	function isInvalidDate(x) {
	  return isNaN(x.getTime());
	} // @internal

	function hasOwnProperty(obj, v) {
	  if (obj == null) {
	    return false;
	  }

	  return Object.prototype.hasOwnProperty.call(obj, v);
	}

	// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
	function code(open, close) {
	  return {
	    open: "\x1B[".concat(open, "m"),
	    close: "\x1B[".concat(close, "m"),
	    regexp: new RegExp("\\x1b\\[".concat(close, "m"), "g")
	  };
	}

	function run(str, code) {
	  return !globalThis || !globalThis.Deno || globalThis.Deno.noColor ? str : "".concat(code.open).concat(str.replace(code.regexp, code.open)).concat(code.close);
	}

	function bold(str) {
	  return run(str, code(1, 22));
	}
	function yellow(str) {
	  return run(str, code(33, 39));
	}
	function cyan(str) {
	  return run(str, code(36, 39));
	}
	function red(str) {
	  return run(str, code(31, 39));
	}
	function green(str) {
	  return run(str, code(32, 39));
	}
	function magenta(str) {
	  return run(str, code(35, 39));
	}
	function dim(str) {
	  return run(str, code(2, 22));
	} // https://github.com/chalk/ansi-regex/blob/2b56fb0c7a07108e5b54241e8faec160d393aedb/index.js

	var ANSI_PATTERN = new RegExp(["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"].join("|"), "g");
	function stripColor(string) {
	  return string.replace(ANSI_PATTERN, "");
	}

	var tableChars = {
	  middleMiddle: "─",
	  rowMiddle: "┼",
	  topRight: "┐",
	  topLeft: "┌",
	  leftMiddle: "├",
	  topMiddle: "┬",
	  bottomRight: "┘",
	  bottomLeft: "└",
	  bottomMiddle: "┴",
	  rightMiddle: "┤",
	  left: "│ ",
	  right: " │",
	  middle: " │ "
	};

	function isFullWidthCodePoint(code) {
	  // Code points are partially derived from:
	  // http://www.unicode.org/Public/UNIDATA/EastAsianWidth.txt
	  return code >= 0x1100 && (code <= 0x115f || // Hangul Jamo
	  code === 0x2329 || // LEFT-POINTING ANGLE BRACKET
	  code === 0x232a || // RIGHT-POINTING ANGLE BRACKET
	  // CJK Radicals Supplement .. Enclosed CJK Letters and Months
	  code >= 0x2e80 && code <= 0x3247 && code !== 0x303f || // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
	  code >= 0x3250 && code <= 0x4dbf || // CJK Unified Ideographs .. Yi Radicals
	  code >= 0x4e00 && code <= 0xa4c6 || // Hangul Jamo Extended-A
	  code >= 0xa960 && code <= 0xa97c || // Hangul Syllables
	  code >= 0xac00 && code <= 0xd7a3 || // CJK Compatibility Ideographs
	  code >= 0xf900 && code <= 0xfaff || // Vertical Forms
	  code >= 0xfe10 && code <= 0xfe19 || // CJK Compatibility Forms .. Small Form Variants
	  code >= 0xfe30 && code <= 0xfe6b || // Halfwidth and Fullwidth Forms
	  code >= 0xff01 && code <= 0xff60 || code >= 0xffe0 && code <= 0xffe6 || // Kana Supplement
	  code >= 0x1b000 && code <= 0x1b001 || // Enclosed Ideographic Supplement
	  code >= 0x1f200 && code <= 0x1f251 || // Miscellaneous Symbols and Pictographs 0x1f300 - 0x1f5ff
	  // Emoticons 0x1f600 - 0x1f64f
	  code >= 0x1f300 && code <= 0x1f64f || // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
	  code >= 0x20000 && code <= 0x3fffd);
	}

	function getStringWidth(str) {
	  str = stripColor(str).normalize("NFC");
	  var width = 0;

	  var _iterator = _createForOfIteratorHelper(str),
	      _step;

	  try {
	    for (_iterator.s(); !(_step = _iterator.n()).done;) {
	      var ch = _step.value;
	      width += isFullWidthCodePoint(ch.codePointAt(0)) ? 2 : 1;
	    }
	  } catch (err) {
	    _iterator.e(err);
	  } finally {
	    _iterator.f();
	  }

	  return width;
	}

	function renderRow(row, columnWidths) {
	  var out = tableChars.left;

	  for (var i = 0; i < row.length; i++) {
	    var cell = row[i];
	    var len = getStringWidth(cell);
	    var needed = (columnWidths[i] - len) / 2; // round(needed) + ceil(needed) will always add up to the amount
	    // of spaces we need while also left justifying the output.

	    out += "".concat(" ".repeat(needed)).concat(cell).concat(" ".repeat(Math.ceil(needed)));

	    if (i !== row.length - 1) {
	      out += tableChars.middle;
	    }
	  }

	  out += tableChars.right;
	  return out;
	}

	function cliTable(head, columns) {
	  var rows = [];
	  var columnWidths = head.map(function (h) {
	    return getStringWidth(h);
	  });
	  var longestColumn = columns.reduce(function (n, a) {
	    return Math.max(n, a.length);
	  }, 0);

	  for (var i = 0; i < head.length; i++) {
	    var column = columns[i];

	    for (var j = 0; j < longestColumn; j++) {
	      if (rows[j] === undefined) {
	        rows[j] = [];
	      }

	      var value = rows[j][i] = hasOwnProperty(column, j) ? column[j] : "";
	      var width = columnWidths[i] || 0;
	      var counted = getStringWidth(value);
	      columnWidths[i] = Math.max(width, counted);
	    }
	  }

	  var divider = columnWidths.map(function (i) {
	    return tableChars.middleMiddle.repeat(i + 2);
	  });
	  var result = "".concat(tableChars.topLeft).concat(divider.join(tableChars.topMiddle)) + "".concat(tableChars.topRight, "\n").concat(renderRow(head, columnWidths), "\n") + "".concat(tableChars.leftMiddle).concat(divider.join(tableChars.rowMiddle)) + "".concat(tableChars.rightMiddle, "\n");

	  for (var _i = 0, _rows = rows; _i < _rows.length; _i++) {
	    var row = _rows[_i];
	    result += "".concat(renderRow(row, columnWidths), "\n");
	  }

	  result += "".concat(tableChars.bottomLeft).concat(divider.join(tableChars.bottomMiddle)) + tableChars.bottomRight;
	  return result;
	}

	// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	var internalObject = {}; // Register a field to internalObject for test access,
	// through Deno[Deno.internal][name].
	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	function exposeForTest(name, value) {
	  Object.defineProperty(internalObject, name, {
	    value: value,
	    enumerable: false
	  });
	}

	var PromiseState;

	(function (PromiseState) {
	  PromiseState[PromiseState["Pending"] = 0] = "Pending";
	  PromiseState[PromiseState["Fulfilled"] = 1] = "Fulfilled";
	  PromiseState[PromiseState["Rejected"] = 2] = "Rejected";
	})(PromiseState || (PromiseState = {}));

	var __classPrivateFieldSet = this && this.__classPrivateFieldSet || function (receiver, privateMap, value) {
	  if (!privateMap.has(receiver)) {
	    throw new TypeError("attempted to set private field on non-instance");
	  }

	  privateMap.set(receiver, value);
	  return value;
	};

	var __classPrivateFieldGet = this && this.__classPrivateFieldGet || function (receiver, privateMap) {
	  if (!privateMap.has(receiver)) {
	    throw new TypeError("attempted to get private field on non-instance");
	  }

	  return privateMap.get(receiver);
	};

	var _printFunc, _a; // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
	var DEFAULT_INDENT = "  "; // Default indent string

	var DEFAULT_MAX_DEPTH = 4; // Default depth of logging nested objects

	var LINE_BREAKING_LENGTH = 80;
	var MAX_ITERABLE_LENGTH = 100;
	var MIN_GROUP_LENGTH = 6;
	var STR_ABBREVIATE_SIZE = 100; // Char codes

	var CHAR_PERCENT = 37;
	/* % */

	var CHAR_LOWERCASE_S = 115;
	/* s */

	var CHAR_LOWERCASE_D = 100;
	/* d */

	var CHAR_LOWERCASE_I = 105;
	/* i */

	var CHAR_LOWERCASE_F = 102;
	/* f */

	var CHAR_LOWERCASE_O = 111;
	/* o */

	var CHAR_UPPERCASE_O = 79;
	/* O */

	var CHAR_LOWERCASE_C = 99;
	/* c */

	var PROMISE_STRING_BASE_LENGTH = 12;
	var CSI = function CSI() {
	  _classCallCheck(this, CSI);
	};
	CSI.kClear = "\x1b[1;1H";
	CSI.kClearScreenDown = "\x1b[0J";
	/* eslint-disable @typescript-eslint/no-use-before-define */

	function getClassInstanceName(instance) {
	  if (_typeof(instance) !== "object") {
	    return "";
	  }

	  if (!instance) {
	    return "";
	  }

	  var proto = Object.getPrototypeOf(instance);

	  if (proto && proto.constructor) {
	    return proto.constructor.name; // could be "Object" or "Array"
	  }

	  return "";
	}

	function createFunctionString(value, _ctx) {
	  // Might be Function/AsyncFunction/GeneratorFunction
	  var cstrName = Object.getPrototypeOf(value).constructor.name;

	  if (value.name && value.name !== "anonymous") {
	    // from MDN spec
	    return "[".concat(cstrName, ": ").concat(value.name, "]");
	  }

	  return "[".concat(cstrName, "]");
	}

	function createIterableString(value, ctx, level, maxLevel, config) {
	  if (level >= maxLevel) {
	    return cyan("[".concat(config.typeName, "]"));
	  }

	  ctx.add(value);
	  var entries = [];
	  var iter = value.entries();
	  var entriesLength = 0;

	  var next = function next() {
	    return iter.next();
	  };

	  var _iterator = _createForOfIteratorHelper(iter),
	      _step;

	  try {
	    for (_iterator.s(); !(_step = _iterator.n()).done;) {
	      var el = _step.value;

	      if (entriesLength < MAX_ITERABLE_LENGTH) {
	        entries.push(config.entryHandler(el, ctx, level + 1, maxLevel, next.bind(iter)));
	      }

	      entriesLength++;
	    }
	  } catch (err) {
	    _iterator.e(err);
	  } finally {
	    _iterator.f();
	  }

	  ctx["delete"](value);

	  if (entriesLength > MAX_ITERABLE_LENGTH) {
	    var nmore = entriesLength - MAX_ITERABLE_LENGTH;
	    entries.push("... ".concat(nmore, " more items"));
	  }

	  var iPrefix = "".concat(config.displayName ? config.displayName + " " : "");
	  var initIndentation = "\n".concat(DEFAULT_INDENT.repeat(level + 1));
	  var entryIndentation = ",\n".concat(DEFAULT_INDENT.repeat(level + 1));
	  var closingIndentation = "\n".concat(DEFAULT_INDENT.repeat(level));
	  var iContent;

	  if (config.group && entries.length > MIN_GROUP_LENGTH) {
	    var groups = groupEntries(entries, level, value);
	    iContent = "".concat(initIndentation).concat(groups.join(entryIndentation)).concat(closingIndentation);
	  } else {
	    iContent = entries.length === 0 ? "" : " ".concat(entries.join(", "), " ");

	    if (stripColor(iContent).length > LINE_BREAKING_LENGTH) {
	      iContent = "".concat(initIndentation).concat(entries.join(entryIndentation)).concat(closingIndentation);
	    }
	  }

	  return "".concat(iPrefix).concat(config.delims[0]).concat(iContent).concat(config.delims[1]);
	} // Ported from Node.js
	// Copyright Node.js contributors. All rights reserved.


	function groupEntries(entries, level, value) {
	  var totalLength = 0;
	  var maxLength = 0;
	  var entriesLength = entries.length;

	  if (MAX_ITERABLE_LENGTH < entriesLength) {
	    // This makes sure the "... n more items" part is not taken into account.
	    entriesLength--;
	  }

	  var separatorSpace = 2; // Add 1 for the space and 1 for the separator.

	  var dataLen = new Array(entriesLength); // Calculate the total length of all output entries and the individual max
	  // entries length of all output entries.
	  // IN PROGRESS: Colors are being taken into account.

	  for (var i = 0; i < entriesLength; i++) {
	    // Taking colors into account: removing the ANSI color
	    // codes from the string before measuring its length
	    var len = stripColor(entries[i]).length;
	    dataLen[i] = len;
	    totalLength += len + separatorSpace;
	    if (maxLength < len) maxLength = len;
	  } // Add two to `maxLength` as we add a single whitespace character plus a comma
	  // in-between two entries.


	  var actualMax = maxLength + separatorSpace; // Check if at least three entries fit next to each other and prevent grouping
	  // of arrays that contains entries of very different length (i.e., if a single
	  // entry is longer than 1/5 of all other entries combined). Otherwise the
	  // space in-between small entries would be enormous.

	  if (actualMax * 3 + (level + 1) < LINE_BREAKING_LENGTH && (totalLength / actualMax > 5 || maxLength <= 6)) {
	    var approxCharHeights = 2.5;
	    var averageBias = Math.sqrt(actualMax - totalLength / entries.length);
	    var biasedMax = Math.max(actualMax - 3 - averageBias, 1); // Dynamically check how many columns seem possible.

	    var columns = Math.min( // Ideally a square should be drawn. We expect a character to be about 2.5
	    // times as high as wide. This is the area formula to calculate a square
	    // which contains n rectangles of size `actualMax * approxCharHeights`.
	    // Divide that by `actualMax` to receive the correct number of columns.
	    // The added bias increases the columns for short entries.
	    Math.round(Math.sqrt(approxCharHeights * biasedMax * entriesLength) / biasedMax), // Do not exceed the breakLength.
	    Math.floor((LINE_BREAKING_LENGTH - (level + 1)) / actualMax), // Limit the columns to a maximum of fifteen.
	    15); // Return with the original output if no grouping should happen.

	    if (columns <= 1) {
	      return entries;
	    }

	    var tmp = [];
	    var maxLineLength = [];

	    for (var _i = 0; _i < columns; _i++) {
	      var lineMaxLength = 0;

	      for (var j = _i; j < entries.length; j += columns) {
	        if (dataLen[j] > lineMaxLength) lineMaxLength = dataLen[j];
	      }

	      lineMaxLength += separatorSpace;
	      maxLineLength[_i] = lineMaxLength;
	    }

	    var order = "padStart";

	    if (value !== undefined) {
	      for (var _i2 = 0; _i2 < entries.length; _i2++) {
	        /* eslint-disable @typescript-eslint/no-explicit-any */
	        if (typeof value[_i2] !== "number" && typeof value[_i2] !== "bigint") {
	          order = "padEnd";
	          break;
	        }
	        /* eslint-enable */

	      }
	    } // Each iteration creates a single line of grouped entries.


	    for (var _i3 = 0; _i3 < entriesLength; _i3 += columns) {
	      // The last lines may contain less entries than columns.
	      var max = Math.min(_i3 + columns, entriesLength);
	      var str = "";
	      var _j = _i3;

	      for (; _j < max - 1; _j++) {
	        // In future, colors should be taken here into the account
	        var padding = maxLineLength[_j - _i3];
	        str += "".concat(entries[_j], ", ")[order](padding, " ");
	      }

	      if (order === "padStart") {
	        var _padding = maxLineLength[_j - _i3] + entries[_j].length - dataLen[_j] - separatorSpace;

	        str += entries[_j].padStart(_padding, " ");
	      } else {
	        str += entries[_j];
	      }

	      tmp.push(str);
	    }

	    if (MAX_ITERABLE_LENGTH < entries.length) {
	      tmp.push(entries[entriesLength]);
	    }

	    entries = tmp;
	  }

	  return entries;
	}

	function stringify(value, ctx, level, maxLevel) {
	  switch (_typeof(value)) {
	    case "string":
	      return value;

	    case "number":
	      // Numbers are yellow
	      // Special handling of -0
	      return yellow(Object.is(value, -0) ? "-0" : "".concat(value));

	    case "boolean":
	      // booleans are yellow
	      return yellow(String(value));

	    case "undefined":
	      // undefined is dim
	      return dim(String(value));

	    case "symbol":
	      // Symbols are green
	      return green(String(value));

	    case "bigint":
	      // Bigints are yellow
	      return yellow("".concat(value, "n"));

	    case "function":
	      // Function string is cyan
	      return cyan(createFunctionString(value));

	    case "object":
	      // null is bold
	      if (value === null) {
	        return bold("null");
	      }

	      if (ctx.has(value)) {
	        // Circular string is cyan
	        return cyan("[Circular]");
	      }

	      return createObjectString(value, ctx, level, maxLevel);

	    default:
	      // Not implemented is red
	      return red("[Not Implemented]");
	  }
	} // Print strings when they are inside of arrays or objects with quotes


	function stringifyWithQuotes(value, ctx, level, maxLevel) {
	  switch (_typeof(value)) {
	    case "string":
	      var trunc = value.length > STR_ABBREVIATE_SIZE ? value.slice(0, STR_ABBREVIATE_SIZE) + "..." : value;
	      return green("\"".concat(trunc, "\""));
	    // Quoted strings are green

	    default:
	      return stringify(value, ctx, level, maxLevel);
	  }
	}

	function createArrayString(value, ctx, level, maxLevel) {
	  var printConfig = {
	    typeName: "Array",
	    displayName: "",
	    delims: ["[", "]"],
	    entryHandler: function entryHandler(entry, ctx, level, maxLevel, next) {
	      var _entry = _slicedToArray(entry, 2),
	          index = _entry[0],
	          val = _entry[1];

	      var i = index;

	      if (!value.hasOwnProperty(i)) {
	        i++;

	        while (!value.hasOwnProperty(i) && i < value.length) {
	          next();
	          i++;
	        }

	        var emptyItems = i - index;
	        var ending = emptyItems > 1 ? "s" : "";
	        return dim("<".concat(emptyItems, " empty item").concat(ending, ">"));
	      } else {
	        return stringifyWithQuotes(val, ctx, level, maxLevel);
	      }
	    },
	    group: true
	  };
	  return createIterableString(value, ctx, level, maxLevel, printConfig);
	}

	function createTypedArrayString(typedArrayName, value, ctx, level, maxLevel) {
	  var valueLength = value.length;
	  var printConfig = {
	    typeName: typedArrayName,
	    displayName: "".concat(typedArrayName, "(").concat(valueLength, ")"),
	    delims: ["[", "]"],
	    entryHandler: function entryHandler(entry, ctx, level, maxLevel) {
	      var _entry2 = _slicedToArray(entry, 2),
	          _ = _entry2[0],
	          val = _entry2[1];

	      return stringifyWithQuotes(val, ctx, level + 1, maxLevel);
	    },
	    group: true
	  };
	  return createIterableString(value, ctx, level, maxLevel, printConfig);
	}

	function createSetString(value, ctx, level, maxLevel) {
	  var printConfig = {
	    typeName: "Set",
	    displayName: "Set",
	    delims: ["{", "}"],
	    entryHandler: function entryHandler(entry, ctx, level, maxLevel) {
	      var _entry3 = _slicedToArray(entry, 2),
	          _ = _entry3[0],
	          val = _entry3[1];

	      return stringifyWithQuotes(val, ctx, level + 1, maxLevel);
	    },
	    group: false
	  };
	  return createIterableString(value, ctx, level, maxLevel, printConfig);
	}

	function createMapString(value, ctx, level, maxLevel) {
	  var printConfig = {
	    typeName: "Map",
	    displayName: "Map",
	    delims: ["{", "}"],
	    entryHandler: function entryHandler(entry, ctx, level, maxLevel) {
	      var _entry4 = _slicedToArray(entry, 2),
	          key = _entry4[0],
	          val = _entry4[1];

	      return "".concat(stringifyWithQuotes(key, ctx, level + 1, maxLevel), " => ").concat(stringifyWithQuotes(val, ctx, level + 1, maxLevel));
	    },
	    group: false
	  }; // eslint-disable-next-line @typescript-eslint/no-explicit-any

	  return createIterableString(value, ctx, level, maxLevel, printConfig);
	}

	function createWeakSetString() {
	  return "WeakSet { ".concat(cyan("[items unknown]"), " }"); // as seen in Node, with cyan color
	}

	function createWeakMapString() {
	  return "WeakMap { ".concat(cyan("[items unknown]"), " }"); // as seen in Node, with cyan color
	}

	function createDateString(value) {
	  // without quotes, ISO format, in magenta like before
	  return magenta(isInvalidDate(value) ? "Invalid Date" : value.toISOString());
	}

	function createRegExpString(value) {
	  return red(value.toString()); // RegExps are red
	}
	/* eslint-disable @typescript-eslint/ban-types */


	function createStringWrapperString(value) {
	  return cyan("[String: \"".concat(value.toString(), "\"]")); // wrappers are in cyan
	}

	function createBooleanWrapperString(value) {
	  return cyan("[Boolean: ".concat(value.toString(), "]")); // wrappers are in cyan
	}

	function createNumberWrapperString(value) {
	  return cyan("[Number: ".concat(value.toString(), "]")); // wrappers are in cyan
	}
	/* eslint-enable @typescript-eslint/ban-types */


	function createPromiseString(value, ctx, level, maxLevel) {
	  var _ref = [-1, "[Not Implemented]", value],
	      state = _ref[0],
	      result = _ref[1];

	  if (state === PromiseState.Pending) {
	    return "Promise { ".concat(cyan("<pending>"), " }");
	  }

	  var prefix = state === PromiseState.Fulfilled ? "" : "".concat(red("<rejected>"), " ");
	  var str = "".concat(prefix).concat(stringifyWithQuotes(result, ctx, level + 1, maxLevel));

	  if (str.length + PROMISE_STRING_BASE_LENGTH > LINE_BREAKING_LENGTH) {
	    return "Promise {\n".concat(DEFAULT_INDENT.repeat(level + 1)).concat(str, "\n}");
	  }

	  return "Promise { ".concat(str, " }");
	} // TODO: Proxy


	function createRawObjectString(value, ctx, level, maxLevel) {
	  if (level >= maxLevel) {
	    return cyan("[Object]"); // wrappers are in cyan
	  }

	  ctx.add(value);
	  var baseString = "";
	  var shouldShowDisplayName = false;
	  var displayName = value[Symbol.toStringTag];

	  if (!displayName) {
	    displayName = getClassInstanceName(value);
	  }

	  if (displayName && displayName !== "Object" && displayName !== "anonymous") {
	    shouldShowDisplayName = true;
	  }

	  var entries = [];
	  var stringKeys = Object.keys(value);
	  var symbolKeys = Object.getOwnPropertySymbols(value);

	  for (var _i4 = 0, _stringKeys = stringKeys; _i4 < _stringKeys.length; _i4++) {
	    var key = _stringKeys[_i4];
	    entries.push("".concat(key, ": ").concat(stringifyWithQuotes(value[key], ctx, level + 1, maxLevel)));
	  }

	  var _iterator2 = _createForOfIteratorHelper(symbolKeys),
	      _step2;

	  try {
	    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	      var _key = _step2.value;
	      entries.push("".concat(_key.toString(), ": ").concat(stringifyWithQuotes( // eslint-disable-next-line @typescript-eslint/no-explicit-any
	      value[_key], ctx, level + 1, maxLevel)));
	    } // Making sure color codes are ignored when calculating the total length

	  } catch (err) {
	    _iterator2.e(err);
	  } finally {
	    _iterator2.f();
	  }

	  var totalLength = entries.length + level + stripColor(entries.join("")).length;
	  ctx["delete"](value);

	  if (entries.length === 0) {
	    baseString = "{}";
	  } else if (totalLength > LINE_BREAKING_LENGTH) {
	    var entryIndent = DEFAULT_INDENT.repeat(level + 1);
	    var closingIndent = DEFAULT_INDENT.repeat(level);
	    baseString = "{\n".concat(entryIndent).concat(entries.join(",\n".concat(entryIndent)), "\n").concat(closingIndent, "}");
	  } else {
	    baseString = "{ ".concat(entries.join(", "), " }");
	  }

	  if (shouldShowDisplayName) {
	    baseString = "".concat(displayName, " ").concat(baseString);
	  }

	  return baseString;
	}

	function createObjectString(value) {
	  if (customInspect in value && typeof value[customInspect] === "function") {
	    try {
	      return String(value[customInspect]());
	    } catch (_unused) {}
	  }

	  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key2 = 1; _key2 < _len; _key2++) {
	    args[_key2 - 1] = arguments[_key2];
	  }

	  if (value instanceof Error) {
	    return String(value.stack);
	  } else if (Array.isArray(value)) {
	    return createArrayString.apply(void 0, [value].concat(args));
	  } else if (value instanceof Number) {
	    return createNumberWrapperString(value);
	  } else if (value instanceof Boolean) {
	    return createBooleanWrapperString(value);
	  } else if (value instanceof String) {
	    return createStringWrapperString(value);
	  } else if (value instanceof Promise) {
	    return createPromiseString.apply(void 0, [value].concat(args));
	  } else if (value instanceof RegExp) {
	    return createRegExpString(value);
	  } else if (value instanceof Date) {
	    return createDateString(value);
	  } else if (value instanceof Set) {
	    return createSetString.apply(void 0, [value].concat(args));
	  } else if (value instanceof Map) {
	    return createMapString.apply(void 0, [value].concat(args));
	  } else if (value instanceof WeakSet) {
	    return createWeakSetString();
	  } else if (value instanceof WeakMap) {
	    return createWeakMapString();
	  } else if (isTypedArray$1(value)) {
	    return createTypedArrayString.apply(void 0, [Object.getPrototypeOf(value).constructor.name, value].concat(args));
	  } else {
	    // Otherwise, default object formatting
	    return createRawObjectString.apply(void 0, [value].concat(args));
	  }
	}

	function stringifyArgs(args) {
	  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	      _ref2$depth = _ref2.depth,
	      depth = _ref2$depth === void 0 ? DEFAULT_MAX_DEPTH : _ref2$depth,
	      _ref2$indentLevel = _ref2.indentLevel,
	      indentLevel = _ref2$indentLevel === void 0 ? 0 : _ref2$indentLevel;

	  var first = args[0];
	  var a = 0;
	  var str = "";
	  var join = "";

	  if (typeof first === "string") {
	    var tempStr;
	    var lastPos = 0;

	    for (var i = 0; i < first.length - 1; i++) {
	      if (first.charCodeAt(i) === CHAR_PERCENT) {
	        var nextChar = first.charCodeAt(++i);

	        if (a + 1 !== args.length) {
	          switch (nextChar) {
	            case CHAR_LOWERCASE_S:
	              // format as a string
	              tempStr = String(args[++a]);
	              break;

	            case CHAR_LOWERCASE_D:
	            case CHAR_LOWERCASE_I:
	              // format as an integer
	              var tempInteger = args[++a];

	              if (typeof tempInteger === "bigint") {
	                tempStr = "".concat(tempInteger, "n");
	              } else if (_typeof(tempInteger) === "symbol") {
	                tempStr = "NaN";
	              } else {
	                tempStr = "".concat(parseInt(String(tempInteger), 10));
	              }

	              break;

	            case CHAR_LOWERCASE_F:
	              // format as a floating point value
	              var tempFloat = args[++a];

	              if (_typeof(tempFloat) === "symbol") {
	                tempStr = "NaN";
	              } else {
	                tempStr = "".concat(parseFloat(String(tempFloat)));
	              }

	              break;

	            case CHAR_LOWERCASE_O:
	            case CHAR_UPPERCASE_O:
	              // format as an object
	              tempStr = stringify(args[++a], new Set(), 0, depth);
	              break;

	            case CHAR_PERCENT:
	              str += first.slice(lastPos, i);
	              lastPos = i + 1;
	              continue;

	            case CHAR_LOWERCASE_C:
	              // TODO: applies CSS style rules to the output string as specified
	              continue;

	            default:
	              // any other character is not a correct placeholder
	              continue;
	          }

	          if (lastPos !== i - 1) {
	            str += first.slice(lastPos, i - 1);
	          }

	          str += tempStr;
	          lastPos = i + 1;
	        } else if (nextChar === CHAR_PERCENT) {
	          str += first.slice(lastPos, i);
	          lastPos = i + 1;
	        }
	      }
	    }

	    if (lastPos !== 0) {
	      a++;
	      join = " ";

	      if (lastPos < first.length) {
	        str += first.slice(lastPos);
	      }
	    }
	  }

	  while (a < args.length) {
	    var value = args[a];
	    str += join;

	    if (typeof value === "string") {
	      str += value;
	    } else {
	      // use default maximum depth for null or undefined argument
	      str += stringify(value, new Set(), 0, depth);
	    }

	    join = " ";
	    a++;
	  }

	  if (indentLevel > 0) {
	    var groupIndent = DEFAULT_INDENT.repeat(indentLevel);

	    if (str.indexOf("\n") !== -1) {
	      str = str.replace(/\n/g, "\n".concat(groupIndent));
	    }

	    str = groupIndent + str;
	  }

	  return str;
	}
	var countMap = new Map();
	var timerMap = new Map();
	var isConsoleInstance = Symbol("isConsoleInstance");
	var Console = /*#__PURE__*/function () {
	  function Console(printFunc) {
	    var _this = this;

	    _classCallCheck(this, Console);

	    _printFunc.set(this, void 0);

	    this[_a] = false;

	    this.log = function () {
	      for (var _len2 = arguments.length, args = new Array(_len2), _key3 = 0; _key3 < _len2; _key3++) {
	        args[_key3] = arguments[_key3];
	      }

	      __classPrivateFieldGet(_this, _printFunc).call(_this, stringifyArgs(args, {
	        indentLevel: _this.indentLevel
	      }) + "\n", false);
	    };

	    this.debug = this.log;
	    this.info = this.log;

	    this.dir = function (obj) {
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	      __classPrivateFieldGet(_this, _printFunc).call(_this, stringifyArgs([obj], options) + "\n", false);
	    };

	    this.dirxml = this.dir;

	    this.warn = function () {
	      for (var _len3 = arguments.length, args = new Array(_len3), _key4 = 0; _key4 < _len3; _key4++) {
	        args[_key4] = arguments[_key4];
	      }

	      __classPrivateFieldGet(_this, _printFunc).call(_this, stringifyArgs(args, {
	        indentLevel: _this.indentLevel
	      }) + "\n", true);
	    };

	    this.error = this.warn;

	    this.assert = function () {
	      var condition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

	      if (condition) {
	        return;
	      }

	      for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key5 = 1; _key5 < _len4; _key5++) {
	        args[_key5 - 1] = arguments[_key5];
	      }

	      if (args.length === 0) {
	        _this.error("Assertion failed");

	        return;
	      }

	      var first = args[0],
	          rest = args.slice(1);

	      if (typeof first === "string") {
	        _this.error.apply(_this, ["Assertion failed: ".concat(first)].concat(_toConsumableArray(rest)));

	        return;
	      }

	      _this.error.apply(_this, ["Assertion failed:"].concat(args));
	    };

	    this.count = function () {
	      var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "default";
	      label = String(label);

	      if (countMap.has(label)) {
	        var current = countMap.get(label) || 0;
	        countMap.set(label, current + 1);
	      } else {
	        countMap.set(label, 1);
	      }

	      _this.info("".concat(label, ": ").concat(countMap.get(label)));
	    };

	    this.countReset = function () {
	      var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "default";
	      label = String(label);

	      if (countMap.has(label)) {
	        countMap.set(label, 0);
	      } else {
	        _this.warn("Count for '".concat(label, "' does not exist"));
	      }
	    };

	    this.table = function (data, properties) {
	      if (properties !== undefined && !Array.isArray(properties)) {
	        throw new Error("The 'properties' argument must be of type Array. " + "Received type string");
	      }

	      if (data === null || _typeof(data) !== "object") {
	        return _this.log(data);
	      }

	      var objectValues = {};
	      var indexKeys = [];
	      var values = [];

	      var stringifyValue = function stringifyValue(value) {
	        return stringifyWithQuotes(value, new Set(), 0, 1);
	      };

	      var toTable = function toTable(header, body) {
	        return _this.log(cliTable(header, body));
	      };

	      var createColumn = function createColumn(value, shift) {
	        return [].concat(_toConsumableArray(shift ? _toConsumableArray(new Array(shift)).map(function () {
	          return "";
	        }) : []), [stringifyValue(value)]);
	      }; // eslint-disable-next-line @typescript-eslint/no-explicit-any


	      var resultData;
	      var isSet = data instanceof Set;
	      var isMap = data instanceof Map;
	      var valuesKey = "Values";
	      var indexKey = isSet || isMap ? "(iter idx)" : "(idx)";

	      if (data instanceof Set) {
	        resultData = _toConsumableArray(data);
	      } else if (data instanceof Map) {
	        var idx = 0;
	        resultData = {};
	        data.forEach(function (v, k) {
	          resultData[idx] = {
	            Key: k,
	            Values: v
	          };
	          idx++;
	        });
	      } else {
	        resultData = data;
	      }

	      var hasPrimitives = false;
	      Object.keys(resultData).forEach(function (k, idx) {
	        var value = resultData[k];
	        var primitive = value === null || typeof value !== "function" && _typeof(value) !== "object";

	        if (properties === undefined && primitive) {
	          hasPrimitives = true;
	          values.push(stringifyValue(value));
	        } else {
	          var valueObj = value || {};
	          var keys = properties || Object.keys(valueObj);

	          var _iterator3 = _createForOfIteratorHelper(keys),
	              _step3;

	          try {
	            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	              var _k = _step3.value;

	              if (primitive || !valueObj.hasOwnProperty(_k)) {
	                if (objectValues[_k]) {
	                  // fill with blanks for idx to avoid misplacing from later values
	                  objectValues[_k].push("");
	                }
	              } else {
	                if (objectValues[_k]) {
	                  objectValues[_k].push(stringifyValue(valueObj[_k]));
	                } else {
	                  objectValues[_k] = createColumn(valueObj[_k], idx);
	                }
	              }
	            }
	          } catch (err) {
	            _iterator3.e(err);
	          } finally {
	            _iterator3.f();
	          }

	          values.push("");
	        }

	        indexKeys.push(k);
	      });
	      var headerKeys = Object.keys(objectValues);
	      var bodyValues = Object.values(objectValues);
	      var header = [indexKey].concat(_toConsumableArray(properties || [].concat(_toConsumableArray(headerKeys), [!isMap && hasPrimitives && valuesKey]))).filter(Boolean);
	      var body = [indexKeys].concat(_toConsumableArray(bodyValues), [values]);
	      toTable(header, body);
	    };

	    this.time = function () {
	      var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "default";
	      label = String(label);

	      if (timerMap.has(label)) {
	        _this.warn("Timer '".concat(label, "' already exists"));

	        return;
	      }

	      timerMap.set(label, Date.now());
	    };

	    this.timeLog = function () {
	      var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "default";
	      label = String(label);

	      if (!timerMap.has(label)) {
	        _this.warn("Timer '".concat(label, "' does not exists"));

	        return;
	      }

	      var startTime = timerMap.get(label);
	      var duration = Date.now() - startTime;

	      for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key6 = 1; _key6 < _len5; _key6++) {
	        args[_key6 - 1] = arguments[_key6];
	      }

	      _this.info.apply(_this, ["".concat(label, ": ").concat(duration, "ms")].concat(args));
	    };

	    this.timeEnd = function () {
	      var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "default";
	      label = String(label);

	      if (!timerMap.has(label)) {
	        _this.warn("Timer '".concat(label, "' does not exists"));

	        return;
	      }

	      var startTime = timerMap.get(label);
	      timerMap["delete"](label);
	      var duration = Date.now() - startTime;

	      _this.info("".concat(label, ": ").concat(duration, "ms"));
	    };

	    this.group = function () {
	      if (arguments.length > 0) {
	        _this.log.apply(_this, arguments);
	      }

	      _this.indentLevel += 2;
	    };

	    this.groupCollapsed = this.group;

	    this.groupEnd = function () {
	      if (_this.indentLevel > 0) {
	        _this.indentLevel -= 2;
	      }
	    };

	    this.clear = function () {
	      _this.indentLevel = 0;

	      __classPrivateFieldGet(_this, _printFunc).call(_this, CSI.kClear, false);

	      __classPrivateFieldGet(_this, _printFunc).call(_this, CSI.kClearScreenDown, false);
	    };

	    this.trace = function () {
	      for (var _len6 = arguments.length, args = new Array(_len6), _key7 = 0; _key7 < _len6; _key7++) {
	        args[_key7] = arguments[_key7];
	      }

	      var message = stringifyArgs(args, {
	        indentLevel: 0
	      });
	      var err = {
	        name: "Trace",
	        message: message
	      };
	      Error.captureStackTrace(err, _this.trace);

	      _this.error(err.stack);
	    };

	    __classPrivateFieldSet(this, _printFunc, printFunc);

	    this.indentLevel = 0;
	    this[isConsoleInstance] = true; // ref https://console.spec.whatwg.org/#console-namespace
	    // For historical web-compatibility reasons, the namespace object for
	    // console must have as its [[Prototype]] an empty object, created as if
	    // by ObjectCreate(%ObjectPrototype%), instead of %ObjectPrototype%.

	    var console = Object.create({});
	    Object.assign(console, this);
	    return console;
	  }

	  _createClass(Console, null, [{
	    key: (_printFunc = new WeakMap(), _a = isConsoleInstance, Symbol.hasInstance),
	    value: function value(instance) {
	      return instance[isConsoleInstance];
	    }
	  }]);

	  return Console;
	}();
	var customInspect = Symbol("Deno.symbols.customInspect");

	exposeForTest("Console", Console);
	exposeForTest("stringifyArgs", stringifyArgs);

	// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
	// Warning! The values in this enum are duplicated in cli/op_error.rs
	// Update carefully!
	var ErrorKind;

	(function (ErrorKind) {
	  ErrorKind[ErrorKind["NotFound"] = 1] = "NotFound";
	  ErrorKind[ErrorKind["PermissionDenied"] = 2] = "PermissionDenied";
	  ErrorKind[ErrorKind["ConnectionRefused"] = 3] = "ConnectionRefused";
	  ErrorKind[ErrorKind["ConnectionReset"] = 4] = "ConnectionReset";
	  ErrorKind[ErrorKind["ConnectionAborted"] = 5] = "ConnectionAborted";
	  ErrorKind[ErrorKind["NotConnected"] = 6] = "NotConnected";
	  ErrorKind[ErrorKind["AddrInUse"] = 7] = "AddrInUse";
	  ErrorKind[ErrorKind["AddrNotAvailable"] = 8] = "AddrNotAvailable";
	  ErrorKind[ErrorKind["BrokenPipe"] = 9] = "BrokenPipe";
	  ErrorKind[ErrorKind["AlreadyExists"] = 10] = "AlreadyExists";
	  ErrorKind[ErrorKind["InvalidData"] = 13] = "InvalidData";
	  ErrorKind[ErrorKind["TimedOut"] = 14] = "TimedOut";
	  ErrorKind[ErrorKind["Interrupted"] = 15] = "Interrupted";
	  ErrorKind[ErrorKind["WriteZero"] = 16] = "WriteZero";
	  ErrorKind[ErrorKind["UnexpectedEof"] = 17] = "UnexpectedEof";
	  ErrorKind[ErrorKind["BadResource"] = 18] = "BadResource";
	  ErrorKind[ErrorKind["Http"] = 19] = "Http";
	  ErrorKind[ErrorKind["URIError"] = 20] = "URIError";
	  ErrorKind[ErrorKind["TypeError"] = 21] = "TypeError";
	  ErrorKind[ErrorKind["Other"] = 22] = "Other";
	  ErrorKind[ErrorKind["Busy"] = 23] = "Busy";
	})(ErrorKind || (ErrorKind = {}));

	var NotFound = /*#__PURE__*/function (_Error) {
	  _inherits(NotFound, _Error);

	  var _super = _createSuper(NotFound);

	  function NotFound(msg) {
	    var _this;

	    _classCallCheck(this, NotFound);

	    _this = _super.call(this, msg);
	    _this.name = "NotFound";
	    return _this;
	  }

	  return NotFound;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var PermissionDenied = /*#__PURE__*/function (_Error2) {
	  _inherits(PermissionDenied, _Error2);

	  var _super2 = _createSuper(PermissionDenied);

	  function PermissionDenied(msg) {
	    var _this2;

	    _classCallCheck(this, PermissionDenied);

	    _this2 = _super2.call(this, msg);
	    _this2.name = "PermissionDenied";
	    return _this2;
	  }

	  return PermissionDenied;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var ConnectionRefused = /*#__PURE__*/function (_Error3) {
	  _inherits(ConnectionRefused, _Error3);

	  var _super3 = _createSuper(ConnectionRefused);

	  function ConnectionRefused(msg) {
	    var _this3;

	    _classCallCheck(this, ConnectionRefused);

	    _this3 = _super3.call(this, msg);
	    _this3.name = "ConnectionRefused";
	    return _this3;
	  }

	  return ConnectionRefused;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var ConnectionReset = /*#__PURE__*/function (_Error4) {
	  _inherits(ConnectionReset, _Error4);

	  var _super4 = _createSuper(ConnectionReset);

	  function ConnectionReset(msg) {
	    var _this4;

	    _classCallCheck(this, ConnectionReset);

	    _this4 = _super4.call(this, msg);
	    _this4.name = "ConnectionReset";
	    return _this4;
	  }

	  return ConnectionReset;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var ConnectionAborted = /*#__PURE__*/function (_Error5) {
	  _inherits(ConnectionAborted, _Error5);

	  var _super5 = _createSuper(ConnectionAborted);

	  function ConnectionAborted(msg) {
	    var _this5;

	    _classCallCheck(this, ConnectionAborted);

	    _this5 = _super5.call(this, msg);
	    _this5.name = "ConnectionAborted";
	    return _this5;
	  }

	  return ConnectionAborted;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var NotConnected = /*#__PURE__*/function (_Error6) {
	  _inherits(NotConnected, _Error6);

	  var _super6 = _createSuper(NotConnected);

	  function NotConnected(msg) {
	    var _this6;

	    _classCallCheck(this, NotConnected);

	    _this6 = _super6.call(this, msg);
	    _this6.name = "NotConnected";
	    return _this6;
	  }

	  return NotConnected;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var AddrInUse = /*#__PURE__*/function (_Error7) {
	  _inherits(AddrInUse, _Error7);

	  var _super7 = _createSuper(AddrInUse);

	  function AddrInUse(msg) {
	    var _this7;

	    _classCallCheck(this, AddrInUse);

	    _this7 = _super7.call(this, msg);
	    _this7.name = "AddrInUse";
	    return _this7;
	  }

	  return AddrInUse;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var AddrNotAvailable = /*#__PURE__*/function (_Error8) {
	  _inherits(AddrNotAvailable, _Error8);

	  var _super8 = _createSuper(AddrNotAvailable);

	  function AddrNotAvailable(msg) {
	    var _this8;

	    _classCallCheck(this, AddrNotAvailable);

	    _this8 = _super8.call(this, msg);
	    _this8.name = "AddrNotAvailable";
	    return _this8;
	  }

	  return AddrNotAvailable;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var BrokenPipe = /*#__PURE__*/function (_Error9) {
	  _inherits(BrokenPipe, _Error9);

	  var _super9 = _createSuper(BrokenPipe);

	  function BrokenPipe(msg) {
	    var _this9;

	    _classCallCheck(this, BrokenPipe);

	    _this9 = _super9.call(this, msg);
	    _this9.name = "BrokenPipe";
	    return _this9;
	  }

	  return BrokenPipe;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var AlreadyExists = /*#__PURE__*/function (_Error10) {
	  _inherits(AlreadyExists, _Error10);

	  var _super10 = _createSuper(AlreadyExists);

	  function AlreadyExists(msg) {
	    var _this10;

	    _classCallCheck(this, AlreadyExists);

	    _this10 = _super10.call(this, msg);
	    _this10.name = "AlreadyExists";
	    return _this10;
	  }

	  return AlreadyExists;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var InvalidData = /*#__PURE__*/function (_Error11) {
	  _inherits(InvalidData, _Error11);

	  var _super11 = _createSuper(InvalidData);

	  function InvalidData(msg) {
	    var _this11;

	    _classCallCheck(this, InvalidData);

	    _this11 = _super11.call(this, msg);
	    _this11.name = "InvalidData";
	    return _this11;
	  }

	  return InvalidData;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var TimedOut = /*#__PURE__*/function (_Error12) {
	  _inherits(TimedOut, _Error12);

	  var _super12 = _createSuper(TimedOut);

	  function TimedOut(msg) {
	    var _this12;

	    _classCallCheck(this, TimedOut);

	    _this12 = _super12.call(this, msg);
	    _this12.name = "TimedOut";
	    return _this12;
	  }

	  return TimedOut;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var Interrupted = /*#__PURE__*/function (_Error13) {
	  _inherits(Interrupted, _Error13);

	  var _super13 = _createSuper(Interrupted);

	  function Interrupted(msg) {
	    var _this13;

	    _classCallCheck(this, Interrupted);

	    _this13 = _super13.call(this, msg);
	    _this13.name = "Interrupted";
	    return _this13;
	  }

	  return Interrupted;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var WriteZero = /*#__PURE__*/function (_Error14) {
	  _inherits(WriteZero, _Error14);

	  var _super14 = _createSuper(WriteZero);

	  function WriteZero(msg) {
	    var _this14;

	    _classCallCheck(this, WriteZero);

	    _this14 = _super14.call(this, msg);
	    _this14.name = "WriteZero";
	    return _this14;
	  }

	  return WriteZero;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var UnexpectedEof = /*#__PURE__*/function (_Error15) {
	  _inherits(UnexpectedEof, _Error15);

	  var _super15 = _createSuper(UnexpectedEof);

	  function UnexpectedEof(msg) {
	    var _this15;

	    _classCallCheck(this, UnexpectedEof);

	    _this15 = _super15.call(this, msg);
	    _this15.name = "UnexpectedEof";
	    return _this15;
	  }

	  return UnexpectedEof;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var BadResource = /*#__PURE__*/function (_Error16) {
	  _inherits(BadResource, _Error16);

	  var _super16 = _createSuper(BadResource);

	  function BadResource(msg) {
	    var _this16;

	    _classCallCheck(this, BadResource);

	    _this16 = _super16.call(this, msg);
	    _this16.name = "BadResource";
	    return _this16;
	  }

	  return BadResource;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var Http = /*#__PURE__*/function (_Error17) {
	  _inherits(Http, _Error17);

	  var _super17 = _createSuper(Http);

	  function Http(msg) {
	    var _this17;

	    _classCallCheck(this, Http);

	    _this17 = _super17.call(this, msg);
	    _this17.name = "Http";
	    return _this17;
	  }

	  return Http;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var Busy = /*#__PURE__*/function (_Error18) {
	  _inherits(Busy, _Error18);

	  var _super18 = _createSuper(Busy);

	  function Busy(msg) {
	    var _this18;

	    _classCallCheck(this, Busy);

	    _this18 = _super18.call(this, msg);
	    _this18.name = "Busy";
	    return _this18;
	  }

	  return Busy;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var errors = {
	  NotFound: NotFound,
	  PermissionDenied: PermissionDenied,
	  ConnectionRefused: ConnectionRefused,
	  ConnectionReset: ConnectionReset,
	  ConnectionAborted: ConnectionAborted,
	  NotConnected: NotConnected,
	  AddrInUse: AddrInUse,
	  AddrNotAvailable: AddrNotAvailable,
	  BrokenPipe: BrokenPipe,
	  AlreadyExists: AlreadyExists,
	  InvalidData: InvalidData,
	  TimedOut: TimedOut,
	  Interrupted: Interrupted,
	  WriteZero: WriteZero,
	  UnexpectedEof: UnexpectedEof,
	  BadResource: BadResource,
	  Http: Http,
	  Busy: Busy
	};

	var hexTable$1 = new Array(256);

	for (var i$1 = 0; i$1 < 256; ++i$1) {
	  hexTable$1[i$1] = "%" + ((i$1 < 16 ? "0" : "") + i$1.toString(16)).toUpperCase();
	}

	function parse$3(str) {
	  var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "&";
	  var eq = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "=";

	  var _ref = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
	      _ref$decodeURICompone = _ref.decodeURIComponent,
	      decodeURIComponent = _ref$decodeURICompone === void 0 ? unescape : _ref$decodeURICompone,
	      _ref$maxKeys = _ref.maxKeys,
	      maxKeys = _ref$maxKeys === void 0 ? 1000 : _ref$maxKeys;

	  var entries = str.split(sep).map(function (entry) {
	    return entry.split(eq).map(decodeURIComponent);
	  });
	  var _final = {};
	  var i = 0;

	  while (true) {
	    if (Object.keys(_final).length === maxKeys && !!maxKeys || !entries[i]) {
	      break;
	    }

	    var _entries$i = _slicedToArray(entries[i], 2),
	        key = _entries$i[0],
	        val = _entries$i[1];

	    if (_final[key]) {
	      if (Array.isArray(_final[key])) {
	        _final[key].push(val);
	      } else {
	        _final[key] = [_final[key], val];
	      }
	    } else {
	      _final[key] = val;
	    }

	    i++;
	  }

	  return _final;
	}
	function encodeStr(str, noEscapeTable, hexTable) {
	  var len = str.length;
	  if (len === 0) return "";
	  var out = "";
	  var lastPos = 0;

	  for (var _i = 0; _i < len; _i++) {
	    var c = str.charCodeAt(_i); // ASCII

	    if (c < 0x80) {
	      if (noEscapeTable[c] === 1) continue;
	      if (lastPos < _i) out += str.slice(lastPos, _i);
	      lastPos = _i + 1;
	      out += hexTable[c];
	      continue;
	    }

	    if (lastPos < _i) out += str.slice(lastPos, _i); // Multi-byte characters ...

	    if (c < 0x800) {
	      lastPos = _i + 1;
	      out += hexTable[0xc0 | c >> 6] + hexTable[0x80 | c & 0x3f];
	      continue;
	    }

	    if (c < 0xd800 || c >= 0xe000) {
	      lastPos = _i + 1;
	      out += hexTable[0xe0 | c >> 12] + hexTable[0x80 | c >> 6 & 0x3f] + hexTable[0x80 | c & 0x3f];
	      continue;
	    } // Surrogate pair


	    ++_i; // This branch should never happen because all URLSearchParams entries
	    // should already be converted to USVString. But, included for
	    // completion's sake anyway.

	    if (_i >= len) throw new errors.InvalidData("invalid URI");
	    var c2 = str.charCodeAt(_i) & 0x3ff;
	    lastPos = _i + 1;
	    c = 0x10000 + ((c & 0x3ff) << 10 | c2);
	    out += hexTable[0xf0 | c >> 18] + hexTable[0x80 | c >> 12 & 0x3f] + hexTable[0x80 | c >> 6 & 0x3f] + hexTable[0x80 | c & 0x3f];
	  }

	  if (lastPos === 0) return str;
	  if (lastPos < len) return out + str.slice(lastPos);
	  return out;
	}
	function stringify$1(obj) {
	  var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "&";
	  var eq = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "=";

	  var _ref2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
	      _ref2$encodeURICompon = _ref2.encodeURIComponent,
	      encodeURIComponent = _ref2$encodeURICompon === void 0 ? escape : _ref2$encodeURICompon;

	  var _final2 = [];

	  for (var _i2 = 0, _Object$entries = Object.entries(obj); _i2 < _Object$entries.length; _i2++) {
	    var entry = _Object$entries[_i2];

	    if (Array.isArray(entry[1])) {
	      var _iterator = _createForOfIteratorHelper(entry[1]),
	          _step;

	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var val = _step.value;

	          _final2.push(encodeURIComponent(entry[0]) + eq + encodeURIComponent(val));
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	    } else if (_typeof(entry[1]) !== "object" && entry[1] !== undefined) {
	      _final2.push(entry.map(encodeURIComponent).join(eq));
	    } else {
	      _final2.push(encodeURIComponent(entry[0]) + eq);
	    }
	  }

	  return _final2.join(sep);
	}
	var decode = parse$3;
	var encode = stringify$1;
	var unescape = decodeURIComponent;
	var escape = encodeURIComponent;

	var querystring = /*#__PURE__*/Object.freeze({
		__proto__: null,
		hexTable: hexTable$1,
		parse: parse$3,
		encodeStr: encodeStr,
		stringify: stringify$1,
		decode: decode,
		encode: encode,
		unescape: unescape,
		escape: escape
	});

	var isWindows$1 = typeof process !== "undefined" && process.browser === undefined ? process.platform === "win32" : navigator.appVersion.includes("Win");
	var forwardSlashRegEx = /\//g;
	var percentRegEx = /%/g;
	var backslashRegEx = /\\/g;
	var newlineRegEx = /\n/g;
	var carriageReturnRegEx = /\r/g;
	var tabRegEx = /\t/g;
	function fileURLToPath(path) {
	  if (typeof path === "string") path = new URL(path);else if (!(path instanceof URL)) throw new errors.InvalidData("invalid argument path , must be a string or URL");
	  if (path.protocol !== "file:") throw new errors.InvalidData("invalid url scheme");
	  return isWindows$1 ? getPathFromURLWin(path) : getPathFromURLPosix(path);
	}

	function getPathFromURLWin(url) {
	  var hostname = url.hostname;
	  var pathname = url.pathname;

	  for (var n = 0; n < pathname.length; n++) {
	    if (pathname[n] === "%") {
	      var third = pathname.codePointAt(n + 2) || 0x20;

	      if (pathname[n + 1] === "2" && third === 102 || // 2f 2F /
	      pathname[n + 1] === "5" && third === 99) {
	        // 5c 5C \
	        throw new errors.InvalidData("must not include encoded \\ or / characters");
	      }
	    }
	  }

	  pathname = pathname.replace(forwardSlashRegEx, "\\");
	  pathname = decodeURIComponent(pathname);

	  if (hostname !== "") {
	    //TODO add support for punycode encodings
	    return "\\\\".concat(hostname).concat(pathname);
	  } else {
	    // Otherwise, it's a local path that requires a drive letter
	    var letter = pathname.codePointAt(1) | 0x20;
	    var sep = pathname[2];

	    if (letter < CHAR_LOWERCASE_A || letter > CHAR_LOWERCASE_Z || // a..z A..Z
	    sep !== ":") {
	      throw new errors.InvalidData("file url path must be absolute");
	    }

	    return pathname.slice(1);
	  }
	}

	function getPathFromURLPosix(url) {
	  if (url.hostname !== "") {
	    throw new errors.InvalidData("invalid file url hostname");
	  }

	  var pathname = url.pathname;

	  for (var n = 0; n < pathname.length; n++) {
	    if (pathname[n] === "%") {
	      var third = pathname.codePointAt(n + 2) || 0x20;

	      if (pathname[n + 1] === "2" && third === 102) {
	        throw new errors.InvalidData("must not include encoded / characters");
	      }
	    }
	  }

	  return decodeURIComponent(pathname);
	}

	function pathToFileURL(filepath) {
	  var resolved = resolve$2(filepath); // path.resolve strips trailing slashes so we must add them back

	  var filePathLast = filepath.charCodeAt(filepath.length - 1);
	  if ((filePathLast === CHAR_FORWARD_SLASH$1 || isWindows$1 && filePathLast === CHAR_BACKWARD_SLASH) && resolved[resolved.length - 1] !== sep$2) resolved += "/";
	  var outURL = new URL("file://");
	  if (resolved.includes("%")) resolved = resolved.replace(percentRegEx, "%25"); // In posix, "/" is a valid character in paths

	  if (!isWindows$1 && resolved.includes("\\")) resolved = resolved.replace(backslashRegEx, "%5C");
	  if (resolved.includes("\n")) resolved = resolved.replace(newlineRegEx, "%0A");
	  if (resolved.includes("\r")) resolved = resolved.replace(carriageReturnRegEx, "%0D");
	  if (resolved.includes("\t")) resolved = resolved.replace(tabRegEx, "%09");
	  outURL.pathname = resolved;
	  return outURL;
	}

	var url = /*#__PURE__*/Object.freeze({
		__proto__: null,
		fileURLToPath: fileURLToPath,
		pathToFileURL: pathToFileURL
	});

	var mainModule = createModule({
	  fs: fs,
	  // need implement readFileSync statSync existsSync
	  path: path$1,
	  buffer: buffer,
	  timers: timers,
	  events: events,
	  querystring: querystring,
	  url: url,
	  util: util$1
	}, window.location.href);
	window.module = mainModule;
	window.exports = mainModule.exports;

	window.require = function require(path) {
	  return mainModule.require(path);
	};

	window.__filename = mainModule.filename;
	window.__dirname = dirname$2(mainModule.filename);
	Object.defineProperty(window, Symbol.toStringTag, {
	  value: 'global',
	  writable: false,
	  enumerable: false,
	  configurable: true
	});
	Object.defineProperty(window, 'process', {
	  value: process$1,
	  enumerable: false,
	  writable: true,
	  configurable: true
	});
	window.global = window;
	window.setImmediate = setImmediate;
	window.clearImmediate = clearImmediate;
	window.dispatchEvent(new Event('resworbready'));

}());
