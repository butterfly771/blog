## [Typescript] 基于reference(typescript)的monorepo架构

> 前言 

记录一下如何使用reference搭建一个一键式**开发，管理， 发布**的**monorepo项目**,

同时如何优化传统monorepo项目架构痛点的过程。


> 导航 

1. 何为monorepo架构， 如何实现一个monorepo的架构
2. reference(typescript)简介？ 
3. 如何基于reference实现一个一键式开发， 同时解决现在monorepo架构的痛点？

### monorepo架构

##### monorepo简介

monorepo是管理代码的一种方式， 不同于传统的一个模块(package)一个仓库的形式， monorepo是在一个代码仓库下面管理多个相互依赖的package包。

这种方式更容易处理包的依赖和引用， 可以极大的提高开发体检。

##### monorepo优势

- 开发环境下面直接可以监听依赖包的变化。
- 一键发布，一键初始化项目(lenra)

但是monorepo也有缺陷， 比如说**单个代码仓库体积过大**, 这个问题我们可以使用git submodule来解决这个问题。

一般的monorepo都是基于lerna来管理的。





Monorepo 是管理项目代码的一个方式，指在一个项目仓库 (repo) 中管理多个模块/包 (package)，不同于常见的每个模块建一个 repo。

现在基于lerna管理的monorepo项目架构， 



记录一下如何基于typepescript的reference优雅的管理一个monorepo架构， 在同时管理多个独立模块的基础下， 实现一键式开发，同时保证代码仓库体积不会太大的问题。 

