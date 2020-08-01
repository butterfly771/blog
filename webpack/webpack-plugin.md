## [Webpack]Plugin

### 为什么需要一个插件

1. webpack基础配置无法满足需求
2. 插件几乎能够更改人意webpack编译结果
3. webpack内部也是通过大量的插件来实现的

### 可以加载插件的常用对象

| 对象           | 钩子                                                         |
| -------------- | ------------------------------------------------------------ |
| Compiler       | run , compile, compilation, make, emit, down                 |
| Compilation    | buildModule, normalModuleLoader, succeedModule, finishModules, seal, optimize, after-seal |
| Module Factory | beforeResolver, agterResolver, module, parser                |
| Parser         | program, statement, call, expression                         |
| Template       | Hash, bootstrap, localVars, render                           |

### 创建插件

webpack的插件由以下部分组成

- 一个Javascript命名函数或类
- 在插件函数的prototype上定义一个apply方法
- 指定一个绑定到webpack自身的时间钩子
- 处理webpack内部实例的特定钩子
- 功能完成后调用webpack提供的毁掉

### Compiler和Compilation

在插件开发中最重要的两个资源就是compiler和compilation对象。 理解他们的角色是拓展webpack引擎重要的第一步。

- compiler对象代表了完整的webpcak环境配置。这个对象在启动webpack时被一次性建立, 并配置好所有可操作的设置，包括options, loader和plugin。当在webpack环境中应用一个插件时, 插件将收到此compiler对象的引用。可以用它来访问webpack的主环境。
- compilation对象代表了一次资源版本构建。 当运行webpack开发环境中间件时, 每当监测到 一个文件变化, 就会创建一个新的compilation， 从而生成一组新的编译资源。 一个compilation对象表现了当前的模块资源，编译生成资源, 变化的文件、以及被跟踪依赖的状态信息。compilation对象也提供了很多关键时机的回调，以供插件做自定义处理时选择使用