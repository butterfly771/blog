### ast-parse系统文档
> 关于ast-parse 拖拽生成页面的使用手册

#### 一.  ast-parse系统简介
这是一个基于json解析的后台系统的编辑器， 使用者可以通过拖拽， 自定义方法，和样式， 去快速搭建一套后台系统。 下面介绍一下使用方法

#### 二.  使用简介
> 项目地址  

  git clone [https://code.vipkid.com.cn/lc/rcms.git] 
  切换到initialWarehouse分支

> 项目目录模快

  此时可以看到项目中已经配置好了常用的路由和方法，那么简单介绍一下每个目录的作用

	>src
	   common 组件拖拽功能相关的组件
		  attributes: 右侧属性设置弹窗
		  componentList: 公用组件列表
		  navigator： 顶部编辑导航栏
		  preview： 预览区域

	   components: 公用组件（新加的组件都放在在）

	   interface: 类型接口文件

	   methods：处理业务相关的js文件

	   static： 静态资源文件夹

	   store: vuex文件夹

	   utils：公用方法
		   parse： json解析器
		   http: 公用ajax封装

	   views： 页面相关



> 准备工作

  1. 进入路由 /admin 即编辑页面
  ![b7dd97eae92595fa53f0d7a4c489227f.png](evernotecid://59C49F04-E250-404B-A1E4-36CAD7F32343/appyinxiangcom/16335822/ENResource/p640)

  左侧是所有的组件， 中间为预览区域， 右侧为当前组件的属性设置

  2. 点击顶部路由配置， 设置当前路由， 如下
	![19414af805f2170e6efc98581966c90b.png](evernotecid://59C49F04-E250-404B-A1E4-36CAD7F32343/appyinxiangcom/16335822/ENResource/p642)


  3. 在methods文件夹下新建一个js文件， 命名规则： [当前的页面名字][Methods].js
	 之后在methods文件夹下的main.js引入， 在进行组件属性设置是页面就会自动
	 解析道里面的方法， 用户就可以在可视化页面进行自定义绑定。

  4. 在staic->css文件夹下面新建当前页面的css, 虽然ast-parse系统会自带大部分样式， 但是依然提供了用户为每一个组件自定义样式的接口， 所以，当出现一些需要个性化定制的样式的时候， 可以在css文件里面自己写css样式， 对ast-parse里面自带的样式进行覆盖。
	注： 建议每个页面新建一个相关的less文件， 并且放置在最外层的div下面， 在common.less文件里面进行引入， 放置样式因为作用于问题互相影响

  5. 准备工作已经就绪， 那么现在就可以拖拽出你们想要的后台系统了


> 使用方法

 1. 先拖入一个div，作为最外层的容器， 可以给这个div添加一个样式， 作为样式作用域
 ![4de97f33984e54183cc1af590e723dbf.png](evernotecid://59C49F04-E250-404B-A1E4-36CAD7F32343/appyinxiangcom/16335822/ENResource/p644)

 2. 请求数据机制

	一些页面可能需要跟后端进行通讯， 当需要在页面初始化发起ajax请求的时候， 点击导航栏中的请求ajax配置， 出现如下弹窗
	![4a77b5f14d1a7063fc7df6a6f3870ea5.png](evernotecid://59C49F04-E250-404B-A1E4-36CAD7F32343/appyinxiangcom/16335822/ENResource/p645)
	可以配置请求地址， 参数类型等等

		> 注：
		> 参数类型
			 function： 代表一个动态的值， 如： vm.$route.params.id， 解析器回去解析当前地址拦中的动态参数
			 string: 静态的值
		> 参数key: 参数的key值
			如 params: {
				  packageName: vm.$route.params.id
			  }
			  这里的packageName就是key值
		> 参数处理函数/值： vm.$route.params.id即参数处理函数/值
	如果有多个ajax或者多个参数的话， 可以点击添加ajax或者添加Ajax

	ajax返回的数据可以通过vm._data.apiData访问

 3.页面初始化执行的方法： 在vue，created生命周期总执行的方法
   这里会自动解析到跟当前页面对应的methods文件下面的方法
   如当前页面路由是 overview, 那么回去解析methods -> overviewMethods 下面的方法， 显示在弹窗中
   ![bdf1aaad904343a92c6fb0c21afa3984.png](evernotecid://59C49F04-E250-404B-A1E4-36CAD7F32343/appyinxiangcom/16335822/ENResource/p646)


 4. 给组件绑定事件：

	如果需要给组件最外层添加click事件， 如给一个button按钮添加click事件， 只需要点右侧属性设置里面的添加事件按钮就可以了， 当然， 需要事先在methods文件下面的[页面]Methodsw文件里面进行方法的定义
	![98f2b48e67a39c3c0d42aac74521ccf6.png](evernotecid://59C49F04-E250-404B-A1E4-36CAD7F32343/appyinxiangcom/16335822/ENResource/p647)

	如果需要给组件内部的元素添加事件， 如给一个select组件添加change事件， 那么可以在右侧的属性设置一栏找到当输入框改变时触发的方法， 选择相应的方法就可以拉，
	当前，方法需要自定义在methods文件下面的[页面]Methods文件
	![21d95589e48787ba216fffa3d6f7e9ba.png](evernotecid://59C49F04-E250-404B-A1E4-36CAD7F32343/appyinxiangcom/16335822/ENResource/p648)

 5. 获取输入框，select框的值
   大部分需要获取值的组件都会在右侧属性设置一栏有个提示
   ![0cc5904c774e3d76827b77f46da3e9c4.png](evernotecid://59C49F04-E250-404B-A1E4-36CAD7F32343/appyinxiangcom/16335822/ENResource/p649)

   那么当前组件选择的值 即 
	 vm._data.bindData['fbe73376-6ee4']

 6. 添加绑定数据
	如果组件需要动态的绑定一些变量显示数据， 那么点击右侧属性设置弹窗里面的绑定数据， 即可以为组件中的某一个地方绑定一个动态的数据， 如select的下拉选项

		>  数据来源： vm: 即在vm._data.apiData中取数据，
				   item: v-for遍历出来的数据中每一项item数据
		>  数据的key: 如vm._data.apiData[key]， 输入框中需要填入的key
		>  指向的字段: 将数据绑定到组件中哪一个变量上面， 
					如，select组件的options选项， 那么此处就填options
	![cf5006ebbe0d82794b5e5c4944a60fd9.png](evernotecid://59C49F04-E250-404B-A1E4-36CAD7F32343/appyinxiangcom/16335822/ENResource/p650)

 7. 添加指令
	当前只支持v-for指令， 会对当前的组件进行for遍历， 如果下面的子组件想绑定数据
	那么选择绑定数据->item数据->选择数据的key值即可
	![f3f47a9c463a152a702c146722672e5d.png](evernotecid://59C49F04-E250-404B-A1E4-36CAD7F32343/appyinxiangcom/16335822/ENResource/p651)


 > 组件的使用注意事项

 1. 输入框组件

		> 获取输入框的值：vm._data['组件id input'];
		   如： vm._data['61292a98-b820input'];


 2. select组件

		> 获取select组件的值： 
		   vm._data.bindData['当前组件的id']
		> 设置select组件的选项： 
		   ````
			let options = {
				'当前组件的id': res.data
			};
			vm.$store.commit('UPDATE_OPTIONS', options);

		   ````
		> 设置select默认选中的值
		  ````
		   vm.$store.state.bindData = {
			'8edfe065-d9b7': res.data.templateId,
			'ff0cf1c8-745e': res.data.skinId
		   };    
		  ````

 3. 弹窗组件 Dialogv1.1

		> 手动控制弹窗的显示隐藏
		  let data = {
			'b52bbef5-1456': true,
		  }

		  vm.$store.commit('UPDATE_DIALOGDATA', data)


 4. 面包屑
	面包屑需要接收一个json, 在此处设置
	title和path, 支持传入变量
	如：[{"title":"首页","path":"store.get('id').id"}]
	![4197abb095acb137df63e39dc6a2a04c.png](evernotecid://59C49F04-E250-404B-A1E4-36CAD7F32343/appyinxiangcom/16335822/ENResource/p653)

 5. table组件: 表格容器组件
	为了方便绑定数据和更自由的拖拽， table分为了table容器组件和tableItem表格子项组件
	所以在使用表格组件的时候， 需要先拖拽一个表格容器组件， 然后将表格子项组件拖拽到左侧箭头指向的tbody处。
	之后， 需要先设置表格头
	注： 表格子项的表格头数据需要跟表格容器的表头数据保持一致

		> [{"label": "表头1","prop": "title1"}] 
		   label: 表头显示的文字
		   prop: 表头绑定的数据key值 (如果不理解参考element表格文档)
	![2c008bd3ca55a89c36a6e92c743efa3a.png](evernotecid://59C49F04-E250-404B-A1E4-36CAD7F32343/appyinxiangcom/16335822/ENResource/p654)

 5. table组件: 表格子项组件
	当设置好表格容器的表格头和表格子项的表头之后， 就可以往表格子项里面拖拽数据了
	也可以绑定v-for指令进行for循环渲染～

 6. 上传组件
	注： 一般需要处理业务需求的上传， 都需要绑定上传时触发的方法
	方法写在[页面名]Methods.js里面
	![da93601e724222b99630eb0f48bbb0aa.png](evernotecid://59C49F04-E250-404B-A1E4-36CAD7F32343/appyinxiangcom/16335822/ENResource/p655)

		> 设置显示上传的数据
		 vm.$store.commit('UPDATE_UPLOADDATA', {
			'aaee771c-9065': {
				url: res.data,
				name: uploadData.file.name
			}
		})



 > 添加组件

   如果当前组件库无法满足业务需求， 那么就需要在src->components下面去添加组件了
   下面介绍如何去自定义组件

   1. 给组件添加[props]id，data-attr属性， )' data-component-active="component" 属性， 如果需要 插槽的话， 需要添加data-slots属性， 例：

		  > 	
		  <div class="dialog-wrapper"  
			:id="id" 
			:data-attr="JSON.stringify(attrList)" 
			:data-slots='JSON.stringify(slots)' 
			data-component-active="component"
		   > </div>
   2. 在script中声明[props]id， attrList属性， slots属性（可选）

		   >		
			@Prop() id!: string;
			@Prop({default: () => ''}) text!: string;
			@Prop({default: () => ''}) title!: string;

			// 当前页面的slots;
			slots: string[] = ['top', 'bottom'];  
  3. attrList属性简介： 当前组件可配置的数据， 即右侧弹窗显示的数据

		 > attrList : 
			{
				astKey: 当前可配置属性的类型，props/attrs/text
				attrKey: 注入组件中的key值， 例如props[key]
				type: 配置弹窗中的类型。text(文本框)/boolean(单选框)/eventHandle(绑定事件)/button(按钮)
				label: 文字描述
				value: 默认值
			}
		  例如：
		  attrList: any[] = [
			{
				astKey: 'props',
				type: 'text',
				attrKey: 'tip',
				label: '获取控制弹窗显示隐藏的变量',
				value: "",
			},
			{
				astKey: 'props',
				attrKey: 'title',
				type: 'text',
				label: '这里是弹窗标题',
				value: '弹窗标题',
			},
			{
				astKey: 'props',
				attrKey: 'handleClose',
				type: 'eventHandle',
				label: '关闭弹窗时触发的方法',
				value: '',
			},
			{
				astKey: 'props',
				attrKey: 'text',
				type: 'text',
				label: '这里是弹窗默认内容',
				value: '这里是弹窗body',
			},
			{
				astKey: 'props',
				type: 'boolean',
				attrKey: 'showDialog',
				label: '控制弹窗是否显示',
				value: true,
			},
			{
				astKey: 'props',
				attrKey: 'delete',
				type: 'button',
				label: '删除组件',
				value: '',
			},
		 ];


   4. 剩下的就是处理组件内的自定义逻辑拉
   5. 最后一步， 在common->componentList引入组件，并且注入， 就可以往页面中拖拽拉

```
<li class="component-item" draggable="true"            @dragstart="dragStart($event, 'Card.vue')" data-attr="1">
				<p class="component-name">卡片组件</p>
				<Card />
			</li>
```

 > 最后一步

  点击下载json， 将json下载到本地， 然后上传到cdn， 在项目配置中进行配置就好啦

  Vipkidcdn: http://vos.vipkid.com.cn/#/vos/storage/file?id=29

  访问cdn数据：  https://s.vipkidstatic.com/

  配置接口返回数据： http://test-config-admin.vipkid.com.cn/#/config-dev



