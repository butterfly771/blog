## vue是如何渲染的


> Vue渲染流程 <br/>
   实例Vue构造函数, 执行_init方法 
   _init()方法: 合并配置, 初始化事件中心, 初始化声明周期, 初始化data, props, computed等数据, callhock beforeCreate生命周期, 这也就是为什么在beforeCreate的时候拿不到数据的原因;

### 一.  实例Vue构造函数, 执行_init方法 
> _init()方法: <br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    主要是合并配置, 初始化事件中心, 初始化声明周期, 初始化data,    props, computed等数据, callhock beforeCreate生命周期, 这也就是为什么在beforeCreate的时候拿不到数据的原因; <br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    这里会判断el.$options上有没有挂载el, 如果没有的话 执行$mount方法实现挂载 

````
    Vue.prototype._init = function (options?: Object) {
        const vm: Component = this
        vm._uid = uid++

        let startTag, endTag
        if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
            startTag = `vue-perf-start:${vm._uid}`
            endTag = `vue-perf-end:${vm._uid}`
            mark(startTag)
        }

        // a flag to avoid this being observed
        vm._isVue = true
        // merge options
        if (options && options._isComponent) {
            // optimize internal component instantiation
            // since dynamic options merging is pretty slow, and none of the
            // internal component options needs special treatment.
            initInternalComponent(vm, options)
        } else {
            vm.$options = mergeOptions(
            resolveConstructorOptions(vm.constructor),
            options || {},
            vm
            )
        }
        /* istanbul ignore else */
        if (process.env.NODE_ENV !== 'production') {
            initProxy(vm)
        } else {
            vm._renderProxy = vm
        }
        // expose real self
        vm._self = vm
        initLifecycle(vm)
        initEvents(vm)
        initRender(vm)
        callHook(vm, 'beforeCreate')
        initInjections(vm) // resolve injections before data/props
        initState(vm)
        initProvide(vm) // resolve provide after data/props
        callHook(vm, 'created')

        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
            vm._name = formatComponentName(vm, false)
            mark(endTag)
            measure(`vue ${vm._name} init`, startTag, endTag)
        }

        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }
````

### 二. Vue实例的挂载
> $mount这个过程主要做两件事: <br />
>  1. 调用vm.render()生成VNode, <br />
>  2. 实例化一个渲染Wathcer, 这个watcher会在初始化的时候执行它的回调函数, 另一个作用就是检测数据变化, 之后会执行他的回调函数(updateComponent), 最终会调用vm.update更新DOM<br />

>  下面看具体的实现细节

> 1. 转换render方法
````
// 缓存原型上的$mount方法
const mount = Vue.prototype.$mount

// 重新定义vue原型上的$mount方法
Vue.prototype.$mount = function (
    el?: string | Element,
    hydrating?: boolean
): Component {
    // 获取el的dom节点
    el = el && query(el)

    // 对Dom节点进行限制, Vue不能挂载到body, html这样的节点上
    if (el === document.body || el === document.documentElement) {
        process.env.NODE_ENV !== 'production' && warn(
        `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
        )
        return this
    }

    const options = this.$options
    // 这里是将template字符串转化成render方法, 通过compileFunction函数实现
    if (!options.render) {
        let template = options.template
        if (template) {
        if (typeof template === 'string') {
            if (template.charAt(0) === '#') {
            template = idToTemplate(template)
            /* istanbul ignore if */
            if (process.env.NODE_ENV !== 'production' && !template) {
                warn(
                `Template element not found or is empty: ${options.template}`,
                this
                )
            }
            }
        } else if (template.nodeType) {
            template = template.innerHTML
        } else {
            if (process.env.NODE_ENV !== 'production') {
            warn('invalid template option:' + template, this)
            }
            return this
        }
        } else if (el) {
            template = getOuterHTML(el)
        }
        if (template) {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' &&        config.performance && mark) {
            mark('compile')
        }

        // 将模板转化为render函数
        const { render, staticRenderFns } = compileToFunctions(template, {
            shouldDecodeNewlines,
            shouldDecodeNewlinesForHref,
            delimiters: options.delimiters,
            comments: options.comments
        }, this)
        options.render = render
        options.staticRenderFns = staticRenderFns

        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
            mark('compile end')
            measure(`vue ${this._name} compile`, 'compile', 'compile end')
        }
        }
    }
    // 最后调用之前缓存的原型上的$mount方法
    return mount.call(this, el, hydrating)
}
````

> 2. 执行原型上的$mount方法

找到el的Dom节点, 执行mountComponent方法
````
    // public mount method
    Vue.prototype.$mount = function (
    el?: string | Element,
    hydrating?: boolean
    ): Component {
        el = el && inBrowser ? query(el) : undefined
        return mountComponent(this, el, hydrating)
    }
````

> mountComponent方法: <br />
    1. 调用vm.render方法生成虚拟DOM; <br />
    2. 实例化一个渲染watcher, 并且将updateComponent作为他的回调函数,  初始化的时候和数据变动的时候都会执行这个回调函数, 更新DOM<br />
    3. 设置vm._isMounted为true, 标识实例已经挂载, 同时执行mount钩子函数

````
    export function mountComponent (
        vm: Component,
        el: ?Element,
        hydrating?: boolean
    ): Component {
        vm.$el = el
        if (!vm.$options.render) {
            vm.$options.render = createEmptyVNode
            if (process.env.NODE_ENV !== 'production') {
            /* istanbul ignore if */
            if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
                vm.$options.el || el) {
                warn(
                'You are using the runtime-only build of Vue where the template ' +
                'compiler is not available. Either pre-compile the templates into ' +
                'render functions, or use the compiler-included build.',
                vm
                )
            } else {
                warn(
                'Failed to mount component: template or render function not defined.',
                vm
                )
            }
            }
        }
        callHook(vm, 'beforeMount')

        let updateComponent
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
            updateComponent = () => {
                const name = vm._name
                const id = vm._uid
                const startTag = `vue-perf-start:${id}`
                const endTag = `vue-perf-end:${id}`

                mark(startTag)
                const vnode = vm._render()
                mark(endTag)
                measure(`vue ${name} render`, startTag, endTag)

                mark(startTag)
                vm._update(vnode, hydrating)
                mark(endTag)
                measure(`vue ${name} patch`, startTag, endTag)
            }
        } else {
            updateComponent = () => {
                vm._update(vm._render(), hydrating)
            }
        }

        // 实例化一个渲染wathcer, 并且updateComponent作为它的参数
        new Watcher(vm, updateComponent, noop, {
                before () {
                if (vm._isMounted) {
                    callHook(vm, 'beforeUpdate')
                }
            }
        }, true /* isRenderWatcher */)
        hydrating = false

        // manually mounted instance, call mounted on self
        // mounted is called for render-created child components in its inserted hook
        if (vm.$vnode == null) {
            vm._isMounted = true
            callHook(vm, 'mounted')
        }
            return vm
        }
````

> 3. update: 将虚拟DOM渲染成真实的节点

    Vue 的 _update 是实例的一个私有方法，它被调用的时机有 2 个，一个是首次渲染，一个是数据更新的时候, 它的核心是调用patch方法

    ````
    Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
        const vm: Component = this
        const prevEl = vm.$el
        const prevVnode = vm._vnode
        const prevActiveInstance = activeInstance
        activeInstance = vm
        vm._vnode = vnode
        // Vue.prototype.__patch__ is injected in entry points
        // based on the rendering backend used.
        if (!prevVnode) {
            // initial render
            vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
        } else {
            // updates
            vm.$el = vm.__patch__(prevVnode, vnode)
        }
        activeInstance = prevActiveInstance
        // update __vue__ reference
        if (prevEl) {
            prevEl.__vue__ = null
        }
        if (vm.$el) {
            vm.$el.__vue__ = vm
        }
        // if parent is an HOC, update its $el as well
        if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
            vm.$parent.$el = vm.$el
        }
        
    }
    ````


> patch方法:<br/>
> 在src/platforms/web/runtime/patch.js可以看到, 它是createPatchFunction方法的返回值

````
export const patch: Function = createPatchFunction({ nodeOps, modules })
````

createPatchFunction

````


````



