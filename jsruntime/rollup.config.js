module.exports = {
  input: 'src/index.js',
  output: {
    file: '../app/src/main/assets/resworb.js',
    format: 'umd',
    name: 'resworb',
    exports: 'named'
  },
  plugins: [
    require('@rollup/plugin-json')()
  ]
}
