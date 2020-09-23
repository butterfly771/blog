# [webpack]Webpack打包文件分析

> 前言

1. 了解经过webpack编译打包后的代码是如何运行在浏览器中的。
2. webpack是如何在浏览器中实现模块化的。不同的模块加载方法编译后是什么样子。
3. 分场景分析不同的模块加载方法编译后是如何运行的。比如说异步加载



### 基本环境配置

1. 环境配置

   ```shell
   # 新建目录
   midir webpack-analysis & cd webpack-analysis
   # 初始化
   npm init
   # 安装webpack环境
   npm install webpack webpack-cli webpack-dev-server --save-dev
   ```

2. 编写webpcack配置文件

   ```js
   const path = require('path');
   const HtmlWebpackPlugin = require('html-webpack-plugin');
   
   module.exports = {
       // 开发环境下和生产环境下的webpack配置有很多不一样的地方
       mode: 'development',
   
       entry: {
           index: "./src/index.js",
       },
   
       output: {
           path: path.resolve(__dirname, 'dist'),//  输出的目录， 只能是绝对目录
           filename: '[name].js'
       }, 
   
       module: {},
     
      	plugins: [
         new HtmlWebpackPlugin({
           template: './src/index.html'
         })
       ]
   }
   ```

### 打包文件分析

#### 1.  场景一： node模块引入（require）

当入口文件为一个普通的js时, 例如这样

```js
// src/index.js
let name = require("./title");
```

```js
// src/title.js
module.exprots = "name: yueqi"
```

经过webpack打包后， 编译后的文件长这样， 那简单分析一下它的结构

```js
(function(modules) {
   ...
})({
    "./src/index.js": (function(module, exports, __webpack_require__) {
        let name = __webpack_require__("./src/login.js");
        console.log(name)
    }),
    "./src/login.js": (function(module, exports) {
        let name = "越祈"
        module.exports = name
    })
})

```

首先， 可以看到这是一个`IIFE`自执行函数， 传入的modules参数是一个对象， 为我们打包的js文件和它的依赖文件

modules对象的key是模块ID, 就是一个相对于项目根目录的相对路径。

值是一个函数, 是一个common.js的模块定义。

任何用户写的代码都会成为common.js的函数体

接下来我们看是如何运行的。

自执行的函数中最后是调用`__webpack_require__`方法， 加载入口模块，并且返回exports

下面看一下这个方法

```js
(function(modules) {
    // 模块缓存
    var installedModules = {};

    // 在浏览器中，webpack自己实现了一套commonJs的执行机制
    function __webpack_require__(moduleId) {
        // 检查模块在缓存中是否存在， 如果存在， 则直接返回缓存中的模块对象
        if(installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }

        // 缓存中不存在的话， 创建一个新的模块， 并且放置到模块的缓存中
        var module = installedModules[moduleId] = {
            i: moduleId,  // identify 模块ID, 模块的标识符
            l: false,  // loaded表示是否已经加载成功或者初始化成功
            exports: {} // 此模块的导出对象
        };
				
        // 执行我们在自执行函数体外传入的那个函数, 即当前的模块函数, 我们传入的函数
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        module.l = true;
				
      	// 返回此模块的导出对象
        return module.exports
    }

    ....
	
    // 加载入口模块并且返回exports
    return __webpack_require__(__webpack_require__.s = "./src/index.js")
})({
    "./src/index.js": (function(module, exports, __webpack_require__) {
        let name = __webpack_require__("./src/login.js");
        console.log(name)
    }),
    "./src/login.js": (function(module, exports) {
        let name = "越祈"
        module.exports = name
    })
})

```

执行到`__webpack_require__`方法的时候， 将模块Id写入缓存，同时调用在自执行函数末尾我们传入的模块函数。

获取到模块js里面的内容，

完成当前依赖加载

#### 2.  场景2 ： es模块和commonJs模块兼容

入口js

```js
let title = reuqire('./title')
console.log(person.name)
```

Title.js

```js
export const name = "yueqi"

export default age = 11
```

运行打包命令后, 得到如下js，格式化后长这个样子

```js
(function(modules) {
    // 模块缓存
    var installedModules = {};

    // 
    function __webpack_require__(moduleId) {
        if(installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }

        // 创建一个新的模块， 并且方知道模块的缓存中
        var module = installedModules[moduleId] = {
            i: moduleId, 
            l: false, 
            exports: {}
        };

        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        module.l = true;

        return module.exports
    }

    // 将modules对象赋值给require.m的属性
    __webpack_require__.m = modules;

    // 把模块的缓存对象放在require.c属性上
    __webpack_require__.c = installedModules;

    // 给一个对象增加一个属性
    // 为了兼容导出定义getter函数
    __webpack_require__.d = function(exports, name, getter) {
        if(__webpack_require__.o(exports, name)) {
            Object.defineProperty(exports, name, {
                enumerable: true, 
                get: getter
            })
        }
    }

    // 表示这是一个es6模块
    __webpack_require__.r = function(exports) {
        if(typeof Swmbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
        }

        // 表示这是一个es6模块
        Object.defineProperty(exports, '__esModule', { value: true })
    }
 
    // 创建一个模拟的命名对象， 把一个任意的模块（common.js es module）都包装成es module的形式
    // {1: shouleRequire, 8: directReturn, 4: noWrapper, 2: copyProperties}
    // value可能是一个模块ID， 也可能是一个模块的导出对象
    // 创建一个模拟的命名空间对象
    // mode & 1  value是一个模块Id，需要通过require来进行加载
    // mode & 2 给该模块添加es的属性， 合并属性， 返回当前模块
    // mode & 4 说明value是一个es6模块了，返回一个esmodule的模块
    // mode & 8  直接返回
    __webpack_require__.t = function(value, mode) {
        // 如果与1为true，说明第一位是1， 那么表示value是模块id， 需要直接通过require加载
        if(mode & 1) { // 加载这个模块Id, 把value重新赋值为到处对象
            value = __webpack_require__(value)
        }
        
        // 8 相当于 1000 说明可以直接返回 如果 & 1 & 8 想挡雨 1001 行为类似于require
        if(mode & 8) {
            return value
        }  

        // 0100 说明是已经包装过的es6的模块了
        if(mode & 4 && value === 'object' && value.__esModule) {
            return value
        }

        var ns = Object.create(null); // 创建一个新对象
        Object.defineProperty(ns, 'default', { enumerable: true, value });

        // 0001 mode === 2 表示要把value所有的属性拷贝到命名空间上。 
        if(mode & 2 && typeof value !== 'string') {
            for(let key in value) {
                __webpack_require__.d(ns, key, function(key) {
                    return value[key].bind(null, key)
                })
            }
        }

        // 此方法在后面蓝加载的时候会用得到
        return ns;

    }

    // 判断对象是否具有某个属性
    __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    }

    // 如果module.__esModule属性的话说明这是一个es的module， 那么返回的是module.default
    // 如果没有__esModule属性的话， 说明这是一个普通的common.js模块, 那么直接返回module
    __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? 
            function getDefault() { return module['default'] } :
            function getModuleExports() { return module };
        
        __webpack_require__.d(getter, 'a', getter);

        return getter;
    }

    // webpack的publicpath 
    __webpack_require__.p = "";

    return __webpack_require__(__webpack_require__.s = "./src/index.js")
})({
    "./src/hello.js":(function(module, __webpack_exports__, __webpack_require__) {
    		__webpack_require__.r(__webpack_exports__);
    		__webpack_require__.d(__webpack_exports__, "name", function() {
          return name; 
        });
    		const name = "yueqi" 
    		const age = 11
    		__webpack_exports__["default"] = (age);
    }),

    "./src/main.js":   (function(module, exports, __webpack_require__) {
        let person = __webpack_require__( "./src/hello.js")
        console.log(person.name)
    }) 
})

```

依然还是从打包文件开始看， 可以看到hello.js里面有一个`__webpack_require__.r`方法和`__webpack_require__.d`方法

- __webpack_require__.r： 如果当前模块是es6模块， 是给模块添加__esModule属性

- __webpack_require__.d： 给当前模块设置name属性，兼容es6模块

- __webpack_require__.t： 重点核心方法

  它的作用是创建一个模拟的命名对象， 把一个任意的模块（common.js es module）都包装成es module的形式

  -  mode & 1  value是一个模块Id，需要通过require来进行加载
  - mode & 2 给该模块添加es的属性， 合并属性， 返回当前模块
  - mode & 4 说明value是一个es6模块了，返回一个esmodule的模块
  - mode & 8  直接返回

最后给当前模块添加default属性，用作默认导出

最后的对象长这个样子


![](https://imgkr2.cn-bj.ufileos.com/e530b69b-3178-48a2-afd3-4fc089e5ef28.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=ZH%252BgFdTj9Hp0yuZy5XFWRJyq6IY%253D&Expires=1596365334)


然后就是走之前的加载逻辑了



#### 场景3: 异步导入

main.js

```js
let button = document.createElement('button');
button.innerHTML = "点我";
document.body.appendChild(button)

button.addEventListener('click', () => {
    import(/* webpackChunkName: "hello" */'./hello').then(result => {
        console.log(result.default)
    })
})
```

Hello.js

```
export const name = "yueqi"

export default age = 11
```

打包后的main.js长这个样子

```js
(function(modules) {
   	__webpack_require__.e = function requireEnsure(chunkId) {
        var promises = [];

        var installedChunkData = installedChunks[chunkId];
        // 如果该代码块没有被加载过， installedChunkData = 0 表示已经被加载
        if(installedChunkData !== 0) { 

          if(installedChunkData) {
            promises.push(installedChunkData[2]);
          } else {
            // 开始创建promise
            var promise = new Promise(function(resolve, reject) {
              installedChunkData = installedChunks[chunkId] = [resolve, reject];
            });

            /* 等价于 *
               installedChunkData = [resolve, reject, promise]
            */
            promises.push(installedChunkData[2] = promise);


            var script = document.createElement('script');
            var onScriptComplete;

            script.charset = 'utf-8';
            script.timeout = 120;
            if (__webpack_require__.nc) {
              script.setAttribute("nonce", __webpack_require__.nc);
            }
            // 返回懒加载的脚本路径
            script.src = jsonpScriptSrc(chunkId);


            var error = new Error();
            onScriptComplete = function (event) {

              script.onerror = script.onload = null;
              clearTimeout(timeout);
              var chunk = installedChunks[chunkId];
              if(chunk !== 0) {
                if(chunk) {
                  var errorType = event && (event.type === 'load' ? 'missing' : event.type);
                  var realSrc = event && event.target && event.target.src;
                  error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
                  error.name = 'ChunkLoadError';
                  error.type = errorType;
                  error.request = realSrc;
                  chunk[1](error);
                }
                installedChunks[chunkId] = undefined;
              }
            };
            var timeout = setTimeout(function(){
              onScriptComplete({ type: 'timeout', target: script });
            }, 120000);
            script.onerror = script.onload = onScriptComplete;
            document.head.appendChild(script);
          }
        }
        return Promise.all(promises);
    };

    function jsonpScriptSrc(chunkId) {
      return __webpack_require__.p + "" + ({"c":"c"}[chunkId]||chunkId) + '.js'
    }
  
  	// 这里的data就是hello.js的内容 
    function webpackJsonpCallback(data) {
        var chunkIds = data[0]; // chunkID
        var moreModules = data[1]; // 额外的代码块

        var moduleId, chunkId, i = 0, resolves = [];
        // 给当前额外的代码块添加到modules对象上
        for(;i < chunkIds.length; i++) {
          chunkId = chunkIds[i]; // title

          // 如果已经加载过, 那么直接拿到它的resolves
          // installedChunks[chunkId] = [resolve, reject, promise]
          if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
            resolves.push(installedChunks[chunkId][0]);
          }
          // 把当前的chunkId设置为0， 表示已经加载成功了
          installedChunks[chunkId] = 0;
        }
        // 把moreModules上面的代码块合并到当前的modules上面
        for(moduleId in moreModules) {
          if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
            modules[moduleId] = moreModules[moduleId];
          }
        }

        // 嵌套懒加载的时候用到，
        // 调用父模块的webpackJsonp array的push方法，也可能是array。pu sh
        // 即递归执行webpackJsonpCallback, 将当前嵌套模块的resolve都设置为true
        if(parentJsonpFunction) parentJsonpFunction(data);

        while(resolves.length) {
          // 挨个执行promise的成功状态
          resolves.shift()();
        }

    };


   	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
    var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
    jsonpArray.push = webpackJsonpCallback;
    jsonpArray = jsonpArray.slice();
    for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
    var parentJsonpFunction = oldJsonpFunction;
})({
  "./src/main.js":(function(module, exports, __webpack_require__) {

    let button = document.createElement('button');
    button.innerHTML = "点我";
    document.body.appendChild(button)
    
    button.addEventListener('click', () => {
      __webpack_require__.e(/*! import() | hello */ "hello")
        .then(__webpack_require__.bind(null, /*! ./hello */ "./src/hello.js")).then(result => {
        console.log(result)
      })
    })
})
```

hello.js

```js
// 这里执行的其实是webpackJsonpCallback， 因为在上面对push方法进行了重写
(window["webpackJsonp"] = window["webpackJsonp"] || []).push(
  [
    ["hello"],
    {
     "./src/hello.js": (function(module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.r(__webpack_exports__);
        __webpack_require__.d(__webpack_exports__, "name", function() { return name; });
        const name = "yueqi"
        const age = 11
        __webpack_exports__["default"] = (age);
      })
    }
	]
);
```

这里面用到了一个`__webpack_require__.e`方， 看一下这个方法。

当存在一个异步加载模块的时候，webpack采用了jsonP的形式对代码块进行了加载，

然后将他们插入到html中

这里注意一下打包文件的结尾有这么一段代码：

```js
var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
// 让数组的push方法重写为webpackJsonpCallback
var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
jsonpArray.push = webpackJsonpCallback;
jsonpArray = jsonpArray.slice();
for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
var parentJsonpFunction = oldJsonpFunction;
```

这里对数组jsonpArray的push方法进行了重写，指向到了`webpackJsonpCallback`上

所以当执行到懒加载的**hello.js**代码块的时候，

**(window["webpackJsonp"] = window["webpackJsonp"] || []).push**其实是执行了`webpackJsonpCallback`，

来看一下这个方法

```js
// 这里的data就是hello.js的内容  
function webpackJsonpCallback(data) {
  var chunkIds = data[0]; // chunkID
  var moreModules = data[1]; // 额外的代码块

  var moduleId, chunkId, i = 0, resolves = [];
  // 给当前额外的代码块添加到modules对象上
  for(;i < chunkIds.length; i++) {
    chunkId = chunkIds[i]; // title

    // 如果已经加载过, 那么直接拿到它的resolves
    // installedChunks[chunkId] = [resolve, reject, promise]
    if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
      resolves.push(installedChunks[chunkId][0]);
    }
    // 把当前的chunkId设置为0， 表示已经加载成功了
    installedChunks[chunkId] = 0;
  }
  // 把moreModules上面的代码块合并到当前的modules上面
  for(moduleId in moreModules) {
    if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
      modules[moduleId] = moreModules[moduleId];
    }
  }

  // 嵌套懒加载的时候用到，
  // 调用父模块的webpackJsonp array的push方法，也可能是array。push
  // 即递归执行webpackJsonpCallback, 将当前嵌套模块的resolve都设置为true
  if(parentJsonpFunction) parentJsonpFunction(data);

  while(resolves.length) {
    // 挨个执行promise的成功状态
    resolves.shift()();
  }
};
```

这个函数其实就是把当前模块的内容合并到全局的缓存对象`installedModules`。

有一个细节，当存在嵌套动态引入的时候，会依次递归的调用父模块的`webpackJsonpCallback`， 

把状态变为resolve。