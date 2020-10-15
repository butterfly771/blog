## React源码解读

![image-20200922081154609](/Users/yueqi/Library/Application Support/typora-user-images/image-20200922081154609.png)

源码目录， 

React-native和react-dom都会依赖react-reconciler包

Scheduler react调度， async module 异步渲染

react: 定义节点和它的一些表现行为

React-dom:  渲染，更新。

### 一. JSX转换Javascript

将以下`<div id="root", key>test</div>`转化位`React.createElement('div', {id: 'root'}, "test")`

### 二. ReactElement

入口

```js
React.createElement(type, config, children);  // 这里的type也可以支持一些其他的原声类型， 比如说fragemeDom
```

### 三.ReactComponent

基础属性+setState

##### isPureReactComponent

继承component, 设置属性isPureComponent= true

### 更新过程：

`function scheduleRootUpdate()` 节点更新的时候触发

![image-20201014084845966](/Users/yueqi/Library/Application Support/typora-user-images/image-20201014084845966.png)

renderROot 





react中的更新分为3种

时间片更新， 同步更新， 异步更新