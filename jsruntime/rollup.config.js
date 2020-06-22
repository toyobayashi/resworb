const rollupBabel = require('@rollup/plugin-babel').default
const rollupNodeResolve = require('@rollup/plugin-node-resolve').default

module.exports = {
  input: 'src/index.js',
  context: 'this',
  output: {
    file: '../app/src/main/assets/resworb.js',
    format: 'iife',
    name: 'resworb',
    exports: 'named'
  },
  plugins: [
    rollupNodeResolve(),
    require('@rollup/plugin-json')(),
    rollupBabel({
      babelHelpers: 'bundled'
    })
  ]
}
