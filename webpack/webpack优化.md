## webpack优化前端项目

```
output: {
   library: 'ab',
   libraryTarget: 'commonjs', // var umd
}
```







### 二. 抽离公用代码仓库

```js
entry: {
   react: ['react', 'react-dom'],
}

output: {
   filename: '_dll_[name].js',
   path: path.resolve(__dirname, 'dist'),
   library: '_dll_[name]',
   // libraryTarget: 'commonjs', // var umd
},

plugins: [
 	new webpack.DllPlugin({
 	    name: '_dll_[name]',
 	    path: path.resolve(__dirname, 'dist', 'manifest.json')
 	})
]
```

##### 使用

```
plugins: [
  new webpack.DllReferencePlugin({
     manifest: path.resolve(__dirname, 'dist', 'manifest.json')
  }) 
]
```



### 三. happypack

使用多线程进行打包

```js
let Happypack = require('happypack')

modules.exports = {
  ...,
  module: {
     noParse: /jquery/,
     rules: [
          { 
              test: /\.js$/,
              exclude: /node_modules/,
              include: path.resolve('src'),
              use: 'Happypack/loader?id=js'
          },
          {
            test: /\.css$/,
            use: 'Happypack/loader?id=css'  
          }
     ]
  },
    
  plugins: [
     new Happypack({
       id: 'js',
       options: {
         presets: [
           '@babel/preset-env',
           '@babel/preset-react'
         ]
       }
     })
    
    new Happypack({
       id: 'css',
       options: {
         presets: [
           'style-loader',
           'css-loader'
         ]
       }
     })
  ]
}
```

### 四. 自带优化

Tree-shaking, 变量合并， 作用域提升 



#### 五. 抽离公用代码仓库

```js
// 多页面公用仓库
module.export = {
  entry: {},
  outout: {},
  optimization: {
    splitChunks: { // 分割代码块
      cacheGroups:{  // 缓存组
        common: { // 公共的模块
          chunks: 'initial',
          minSize: 0, 
          minChunks: 2, // 至少饮用两次以上
        },
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          priority: 1, // 权重
          minSize: 0, 
          minChunks: 2, // 至少饮用两次以上
        
        }
      }
    }
  }
}
```



### 六. 懒加载

### 七.热更新

```js
module.exports = {
  plugins: [
    new webpack.namedModulesPlugin();
    new webpack.HotModuleReplacementPlugin()
  ]
}

// 文件
if(module.hot) {
  module.hot.accept('./source', () => {
    require('./source')
  })
}
```

