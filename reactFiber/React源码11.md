## React源码

#### concurrentMode

协调优先级， 区分优先级

concurrentMode产生的更新都是低优先级的更新

asyncmode下面才会区分优先级， syncmode模式下不会区分优先级

```
<concurrentMode>
	<Parent/>
</concurrentMode>
```

#### suspense  and lazy

异步加载组件

等所有组件的promise加载完成后， 切换fallback展示的内容   

```
let lazyComponent = import(./lazy)
<Suspense fallback="loadingdata">
   <Component />
   <lazyComponent />
</Suspense>
```

### React中的更新

1. ##### ReactDom.render || hydrate

   (1) 应用流程

   - 调用render方法
   - 创建ReactRoot --> `ReactRoot()`创建FiberRoot -->`ReactRoot()` -->    `DomRender.updateComtainer`
   - 计算过期时间 computeExpirationForFiber()
   - scheduleRootUpdate: 创建update `enqueueUpdate` -->  `scheduleWord: 开始进行任务调度`
   - 创建FiberRoot和RootFiber
   - 创建更新
   - 调度器进行调度

   (2) fiberRoot

   - createFIberRoot

   (3)   fiber

   ​	每一个ReactElement对应一个Fiber对象

   ​    记录节点的各种状态

   ​    串联整个应用形成树结构

   (4)  Update

   ​	用于记录组件状态的改变

      存放于UpdateQueue中

      多个Update可以同时存在

   - 入口在`scheduleRootUpdate`方法中。 创建Update对象
   - 创建UpdateQueue的时候传入的expirationTime是如何计算的?

2. workInProgre s s是即将更新的下一个fiber树， current是当前树， 即旧的fiber树

3. ##### setState

4. ##### forceUpdate

#### 