## 手撸React源码(一): update和schedule

> 前言： 记录一下学习react-schedule的一些心得和体会

通过改文章， 学习一下react核心调度算法

react中的更新有三种方式， 

- render
- setState
- forceUpdate

不管是通过以上那种方式， react中都会把所有更新先创建出一个更新的双向链表

React通过createElement创建出来虚拟dom之后

![concurrent-mode-0d4bb69d1cb36d3fc6feccab313be000](/Users/yueqi/Desktop/concurrent-mode-0d4bb69d1cb36d3fc6feccab313be000.gif)

![sync-mode-67e8c339531a7b82c9f53da77e69adcf](/Users/yueqi/Desktop/sync-mode-67e8c339531a7b82c9f53da77e69adcf.gif)





react中采用了fiber架构， 目地就是将react中的更新和节点作为一个可拆分，可中断的单元。

那么调度系统的作用就是给每个单元设置优先级。 

通过跟浏览器进行协调`requestIdcallBack`来进行协调更新， 

即程序会想浏览器申请每一帧更新的剩余时间。 用来处理一些高游戏县级的任务，

当任务过期之后呢， 再把控制权交还给浏览器。 浏览器用来继续展示动画等等一些操作





优先级分为以下几种

**Scheduler（调度）** 通用协作主线程调度程序由 React Core 团队开发，可以在浏览器中注册具有不同优先级的回调。 在写这篇文章的时候，优先级为：

- `Immediate` 用于需要同步运行的任务
- `UserBlocking` （250ms 超时）用于应作为用户交互结果运行的任务（按钮点击）
- `Normal` （5s超时）用于不必立即感受到的更新
- `Low`（10s超时）可以延迟但最终必须完成的任务
- `Idle` （没有超时）对于根本不需要运行的任务（例如隐藏的屏幕外内容）



接下来分为两个方面来介绍

- 如何计算过期时间expirerTime
- 如何进行调度
- react中的优先级

用户的交互是高优先级的， 不能被js的运行打断



### 1. 计算过期时间， 区分优先级



![image-20201018151013043](/Users/yueqi/Library/Application Support/typora-user-images/image-20201018151013043.png)







### expirationTime

expirationTime是如何计算的

调用栈



Render --> legacyRenderSubtreeIntoContainer --> updateContainer

```js
export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): ExpirationTime {
  const current = container.current;
  const currentTime = requestCurrentTime();
  if (__DEV__) {
    // $FlowExpectedError - jest isn't a global, and isn't recognized outside of tests
    if ('undefined' !== typeof jest) {
      warnIfUnmockedScheduler(current);
      warnIfNotScopedWithMatchingAct(current);
    }
  }
  const suspenseConfig = requestCurrentSuspenseConfig();
  const expirationTime = computeExpirationForFiber(
    currentTime,
    current,
    suspenseConfig,
  );
  return updateContainerAtExpirationTime(
    element,
    container,
    parentComponent,
    expirationTime,
    suspenseConfig,
    callback,
  );
}
```

- requestCurrentTime 首先要获取当前的时间

  ```js
  function requestCurrentTime() {
    if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
      // We're inside React, so it's fine to read the actual time.
      return msToExpirationTime(now());
    }
    // We're not inside React, so we may be in the middle of a browser event.
    if (currentEventTime !== NoWork) {
      // Use the same start time for all updates until we enter React again.
      return currentEventTime;
    }
    // This is the first update since React yielded. Compute a new start time.
    currentEventTime = msToExpirationTime(now());
    return currentEventTime;
  }
  ```

- MsToExpirationTime

  ```js
  export const Idle = 2;
  export const Sync = MAX_SIGNED_31_BIT_INT;
  export const Batched = Sync - 1;
  
  const UNIT_SIZE = 10;
  const MAGIC_NUMBER_OFFSET = Batched - 1;
  
  // 1 unit of expiration time represents 10ms.
  export function msToExpirationTime(ms: number): ExpirationTime {
    // Always add an offset so that we don't clash with the magic number for NoWork.
    return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0);
  }
  
  ```

- computeExpirationForFiber

  ```js
  export function computeExpirationForFiber(
    currentTime: ExpirationTime,
    fiber: Fiber,
    suspenseConfig: null | SuspenseConfig,
  ): ExpirationTime {
    const mode = fiber.mode;
    if ((mode & BatchedMode) === NoMode) {
      return Sync;
    }
  
    const priorityLevel = getCurrentPriorityLevel();
    if ((mode & ConcurrentMode) === NoMode) {
      return priorityLevel === ImmediatePriority ? Sync : Batched;
    }
  
    if ((executionContext & RenderContext) !== NoContext) {
      // Use whatever time we're already rendering
      // TODO: Should there be a way to opt out, like with `runWithPriority`?
      return renderExpirationTime;
    }
  
    let expirationTime;
    if (suspenseConfig !== null) {
      // Compute an expiration time based on the Suspense timeout.
      expirationTime = computeSuspenseExpiration(
        currentTime,
        suspenseConfig.timeoutMs | 0 || LOW_PRIORITY_EXPIRATION,
      );
    } else {
      // Compute an expiration time based on the Scheduler priority.
      switch (priorityLevel) {
        case ImmediatePriority:
          expirationTime = Sync;
          break;
        case UserBlockingPriority:
          // TODO: Rename this to computeUserBlockingExpiration
          expirationTime = computeInteractiveExpiration(currentTime);
          break;
        case NormalPriority:
        case LowPriority: // TODO: Handle LowPriority
          // TODO: Rename this to... something better.
          expirationTime = computeAsyncExpiration(currentTime);
          break;
        case IdlePriority:
          expirationTime = Idle;
          break;
        default:
          invariant(false, 'Expected a valid priority level');
      }
    }
  
    // If we're in the middle of rendering a tree, do not update at the same
    // expiration time that is already rendering.
    // TODO: We shouldn't have to do this if the update is on a different root.
    // Refactor computeExpirationForFiber + scheduleUpdate so we have access to
    // the root when we check for this condition.
    if (workInProgressRoot !== null && expirationTime === renderExpirationTime) {
      // This is a trick to move this update into a separate batch
      expirationTime -= 1;
    }
  
    return expirationTime;
  }
  ```

  