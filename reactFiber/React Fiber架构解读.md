## React Fiber架构解读

> 前言
> 记录一下自己学习react fiber架构的一个过程

由于js**单线程阻塞式**的特性， 导致浏览器在同一时间， 只能干一件事。
所以对现在的前端框架而言，快速完成计算并且响应用户的操作成为了各大框架需要的解决的首要问题。

- vue:  尽可能的把每个单元(模版/组件)划分的足够小 ， 同时基于响应式数据的通知机制， 可以保证数据改变后， 精确的控制到每个单元进行更新。
- react:   react16之前， 每次更新， 都会从根节点的虚拟DOM开始进行比对，所以当数据量特别大的时候， 会非常耗费性能。也会导致用户输入的时候， 卡顿 在dom比对的过程中

直到.....react16采用了全新的fiber架构。



#### 目标：

通过本篇文章， 希望达到以下目标

1. React fiber架构简介
2. React fiber的渲染过程分析



#### fiber架构简介

> 何为fiber架构

fiber是一种数据结构， 也可以说是一个任务单元。

React16的fiber架构就是**基于fiber这种数据结构**实现的一种时间切片式的可拆分，可中断的调和器架构（Fiber Reconciler）。



#### fiber架构的优势

- 它把之前作为一个整体的dom diff和渲染过程拆分成一个细小的fiber单元， 

  使整个渲染过程可以被中断， 让位给高优先级的任务， 等到浏览器空闲时间再回复渲染。

- 发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应

- 快速响应用户操作， 让用户觉得够快， 不阻塞用户操作

![](https://tva1.sinaimg.cn/large/007S8ZIlly1gj6neaznjpj30u00uon0i.jpg)

#### fiber单元

那么, fiber到底是一种什么样的数据结构呢

![](https://tva1.sinaimg.cn/large/007S8ZIlly1gj6n68l3h9j31ew0g4dk6.jpg)

在react中， 每个节点都是这样的一个fiber结构单元， 基于这种结构单元， react将整个页面组装成了一个链表结构。 即每一个fiber节点单元中， 都会有一个指针，指向下一个要跟新的单元。 如图所示

![](https://tva1.sinaimg.cn/large/007S8ZIlly1gj7dhw2afxj30ps0lqdhj.jpg)

流程解析：

- 浏览器开始调度， 会从根节点开始处理virtual DOM(createElement返回结果)， 将其和它的Children转化为fiber单元。
- A1节点作为根节点的一个字元素， 转化成fiber单元后，除了基础的一些信息(tag, type), 比较重要的是两个属性， 一个是return， 指向于A1节点的父节点， 一个是child, 指向于A1节点的第一个children, B1, 还有一个siblings， 指向于A1的兄弟节点
- A1的fiber单元处理完成之后， 会处理他的child（B1）,   检查B1有没有child， 如果存在的话， 处理B1的child C1节点
- C1节点处理完之后， 发现C1没有子元素了， 那么处理C1的兄弟节点C2。 
- C2即没有child也没有silbing兄弟节点， 那么拿到他的return父节点B1
- B1之前已经处理过child了， 开始处理B1的slibings节点。 处理完成之后返回到B1的父节点A1
- reconciliation阶段结束

接下来通过代码分析这个过程

#### React Fiber架构的渲染流程

1. 用户调用**ReactDOM.render**方法 

   ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gj6n47hsldj310y054gm9.jpg)
   
2. 浏览器调用**requestIdleCallback**方法，开启调度

   ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gj6n0xgmywj310w0o4aef.jpg)

   这里浏览器会以一帧作为参考维度， 优先执行高优任务。

   每一帧执行一个任务单元， 执行结束后的剩余时间交给用户。

3. ReactDom.render方法将挂载节点转化为fiber节点, 同时开始**reconciler**阶段

   ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gj6mz008whj31ko0d4adn.jpg)

   react主要有两个阶段

   - Render/Reconciler:  这个阶段主要是生成fiber树， 同时收集effect list, 此阶段可以被暂停
   - commit阶段：这个阶段主要进行dom更新创建的工作， 此阶段不可以暂停。

4. **reconciler阶段**

   这里引入三个概念

   - workInProgressRoot： 根fiber节点， rootFiber节点
   - nextUnitOfWork： 下一个更新的Fiber单元， react16的更新是一个链表， 每个fiber单元处理完毕之后， 又一个指针， 指向下一个需要处理的fiber节点
   - currentRoot： 当前正在工作的fiber树
   - alternate: 上一个更新的fiber树

   如果是初次渲染的话， 从根节点(rootFiber)开始调度

   ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gj6mmfm263j30lc084q3p.jpg)

5. 处理当前的fiber节点

   根据节点执行执行不同的操作： 

   - 根（rootFiber）:  直接处理孩子fiber

   ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gj6ml4i88tj30tq0w4dl4.jpg)

6. 处理孩子**reconcileChildren**

   遍历当前节点所有孩子, 生成对应的fiber节点,

    同时建立关联关系， 形成一个链表(firstEffect和lastEffect)

   ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gj6moblyw7j30wp0u048a.jpg)

7. 当前fiber节点解析完成。 执行下一步的操作

   - 如果当前fiber节点有孩子的话， 浏览器继续解析当前fiber节点的第一个孩子
   - 如果没有孩子的话， 找到它的兄弟
   - 如果没有孩子也没有兄弟， 返回父节点， 标志当前fiber节点调度完成
   - 建立effect链表， 收集effect

   ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gj6mqfpsu8j30yt0u0dmm.jpg)

   

8. commit阶段， 处理 副作用。

   将之前手机到的effect链表依次更新

   ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gj6mtslifwj30rw0l441l.jpg)

   依次处理新增， 删除， 更新节点等操作

   ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gj6mx21hcij30yg0u0gvd.jpg)

#### 双缓冲机制

- 第一次更新， 建立currentRoot（渲染成功之后的根节点）

- 第二次更新， 建立alternate树， 复用上一次更新创建的节点

- 第三次更新， workInProgress树指向上一次更新的alternate树， 即第一次更新创建的树

  

