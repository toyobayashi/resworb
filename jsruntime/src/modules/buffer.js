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
var Buffer = /*#__PURE__*/function (_Uint8Array) {
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

export { Buffer };
export default Buffer;
