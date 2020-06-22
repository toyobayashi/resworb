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

export default Stat;
