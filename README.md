# resworb

在 Android Webview 中模拟 Node.js 环境，无需 Webpack 即可 “无缝” 使用 npm 包，支持 Chrome 远程调试。

## 快速开始

``` bash
$ git clone https://github.com/toyobayashi/resworb.git
$ cd resworb/jsruntime
$ npm install
$ npm run build
```

把项目导进 Android Studio 运行。

## 用法

``` js
// 只有 resworbready 事件响应之后才能拿到 window.require
window.addEventListener('resworbready', function () {
  // 被 require 的模块中和 Node.js 一样可以用 module exports require __dirname __filename
  require('./index.js')
})
```

## 可用的 Node.js API

除了 `fs` 和 `module`, 这些模块都是从 deno 标准库中移植过来的。

* window.process (partly)
* buffer (window.Buffer)
* path
* timers (window.setImmediate / window.clearImmediate)
* events
* querystring
* url
* util
* fs (partly)
* module (partly)

## module 的用法

`module` 中的模块解析逻辑移植于 Node.js，需要传入一个 `fs` 模块，要求至少实现以下接口：

* `fs.readFileSync(path: string, encoding: 'utf8'): string`
* `fs.existsSync(path: string): boolean`
* `fs.statSync(path: string): { isDirectory: () => boolean; isFile: () => boolean; [k: string]: any }`

差不多是这样用的：

``` js
import { createModule, makeRequireFunction } from './modules/module.js';

const injectBuiltinModules = {
  fs: fs, // need implement readFileSync statSync existsSync,
  path: path, // optional
  // ...
}
const mainModule = createModule(
  injectBuiltinModules, // 只有在这里的模块 require 才能拿到
  window.location.href // 入口模块的 filename，这里就取 HTML 本地路径 file:///android_asset/index.html
)
// module 不需要手动注入
// createModule 会把 Module 构造函数挂上去 injectBuiltinModules.module === Module
// 这样 require('module') 就可以拿到 Module 构造函数

// 暴露到全局
window.module = mainModule
window.exports = mainModule.exports
window.require = makeRequireFunction(mainModule, mainModule)
```

详细可以看 `jsruntime` 的源码。
