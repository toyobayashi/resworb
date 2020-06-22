const rollupBabel = require('@rollup/plugin-babel').default
const rollupNodeResolve = require('@rollup/plugin-node-resolve').default
const rollupCommonJS = require('@rollup/plugin-commonjs')
const { nativeRequireRollupPlugin } = require('@tybys/native-require/plugins/rollup')

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
    nativeRequireRollupPlugin(),
    rollupNodeResolve(),
    rollupCommonJS({
      extensions: ['.js', 'jsx', '.ts', '.tsx']
    }),
    require('@rollup/plugin-json')(),
    rollupBabel({
      babelHelpers: 'bundled'
    })
  ]
}
