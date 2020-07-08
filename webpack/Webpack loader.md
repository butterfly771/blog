# Webpack loader



```js
resolveLoader: {
        // alias: {
        //     "babel-loader": resolve(__dirname, 'loaders/babel-loader.js')
        // }
        modules: [
            path.resolve(__dirname, 'loaders'), 
            "node_modules"
        ]
    },

    module: {
        rules: [
            {
                test: /\.css$/, // 如果要require或import文件是css文件的话
                use: ['style-loader', 'css-loader'], // loader是一个函数
            },
            {
                test: /\.js$/, // 如果要require或import文件是css文件的话
                use: ["loader1", 'loader2', 'loader3'],  // 在真正执行的时候是从右到左， 从下到上执行
            }
        ],

    },
```

loader执行顺序， 从下到上， 从右到左



#### pitch

- Normal loader
- Pitch(跳过) loader  

![image-20200708074908981](/Users/yueqi/Library/Application Support/typora-user-images/image-20200708074908981.png)

![image-20200708081827868](/Users/yueqi/Library/Application Support/typora-user-images/image-20200708081827868.png)![image-20200708081827883](/Users/yueqi/Library/Application Support/typora-user-images/image-20200708081827883.png)

### loader runner

loader的叠加顺序= post(后置) + inline(内联) + normal(正常) + pre(前置)



loader分类

- 前置
- 正常/普通
- 行内 inline
- 后置

