

## nginx

### Nginx应用场景

1. 静态资源服务器
2. 反向代理服务
3. api接口服务：权限控制， 缓存， 访问数据库 

#### nginx优势

- 高并发高性能
- **可拓展性好**
- 高可靠性
- 热部署
- 开源许可证

#### nginx架构

1. 清凉
2. 架构： 采用单线程 ， 多进程和多路io复用模型 （node）
3. 多路I/O复用

工作流程

![image-20200518090127640](/Users/yueqi/Library/Application Support/typora-user-images/image-20200518090127640.png)



I/O模式

对于一次IO访问， 数据会掀背拷贝到操作系统内核的缓冲区中， 然后才会从操作系统内核的缓冲区拷贝到应用程序的缓冲区， 最后交给进行。 所以， 当一次I/O操作发生时， 它会经历两个阶段：

- a. 等待数据准备
- b. 将数据从内核拷贝到进程中



I/O多路复用

多个文件描述符的I/O操作都能在一个线城里面兵法交替顺序完成， 复用线城



进程和线程

进程是分配资源的最小单位

一个进程可以有多个线程在工作

 线程更加轻量级， 可以随时销毁



关闭防火墙

```
systemctl disable firewalld.service
```

关闭linux子系统

```
vi /etc/selinux/config
```

安装依赖

```
yum -y install gcc gcc-c++ autoconf pcre pcre-devel make authmake
yum -y install wget httpd-tools vim
```

查看可安装列表

```
yum list | grep nginx
```

查看nginx安装目录

```
rpm  -ql nginx
```

日志切割文件

```
ls /var/log/nginx/*.log

```

Nginx 启动， 重载

```
systemctl reload nginx.service
```

查看ngin x进程

```
ps -ef | grep nginx
```



配置文件

- /etc/nginx/nginx.conf 主配置文件
- /ect/nginx/conf.d/*.conf 包含conf.d目录下面的所有配置文件
- /etc/nginx/conf.d/default.conf

语法

```nginx
# 使用#号可以添加注释 $标示变量
# 配置文件由指令和指令块组成， 指令块以{}将多条指令组织在一起
http {
  # include 语句允许把多个配置文件组合 起来以提升可维护性
  include mime.types;
  # 每条指令以分号结尾， 指令与参数之间以空格分隔
  default_type applycation/octet-stream;
  sendfile on;
  keepalive_timeout 65;
  # 每个server对应一个网站
  server {
    listen 80; # 监听的端口号
    server_name localhost; # 域名
    # 指定字符集
    charset: utf-8
    # 指定访问日志的格式和字符集
    access_log /var/log/nginx/host.access.log main;
    # 有些指令可以支持正则表达式
    location / { # 匹配所有的路径 
      root html # 静态文件根目录
      index index.html index.html # 索引文件
    }
    error_page 500 502 503 504 50x.html
    # 服务器端错误状态码重定向到50x.html
    location = /50x.html {
      root html;
    }
    # 如果说访问的文件名是.php结尾的话， 会把此请求转发给127.0.0.1
    location ~ \.php$ {
      proxy_pass http://127.0.0.1;
    }
    
    # 如果说访问的文件名是.php结尾的话，会把请求转发给127.0.0.1:9000;
    location ~ \.php$ {
      root html;
      fastcgi_pass 127.0.0.1:9000;
      fastcgi_index index.php;
      fastcgi_param SCRIPT_FILENAME /scripts$fastcgi_script_name;
      include fastcgi_params
    }
  }
}
```

Nginx.conf

```nginx
user  nginx; # 设置运行此nginx的用户名 
worker_processes  1; # 工作进行树

error_log  /var/log/nginx/error.log warn; # 指定错误日志的路径
pid        /var/run/nginx.pid; # 这是一个文件， 存放的是nginx的进程号


events {
    worker_connections  1024; # 工作进程的最大链接数
}


http {
    # 包含内容和文件名后缀的对应关系
    include       /etc/nginx/mime.types;
   	# 默认content-type 类型
    default_type  application/octet-stream;
		# 定义一个日志的格式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
  
    log_format main2 '"$arg_name" "$http_host" "set_http_date"'
		# 指定访问日志的存放位置， 格式为main
    access_log  /var/log/nginx/access.log  main2;
		# 零拷贝模式， 不启用用户空间
    sendfile        on;
  	# 不立即推送， 有一定的缓存
    #tcp_nopush     on;
		# 活动链接的超时时间
    keepalive_timeout  65;
		# 是否启用压缩
    #gzip  on;
		# 包含其它配置文件
    include /etc/nginx/conf.d/*.conf;
}

```



监控nginx日志

```
tail -f /var/log/nginx/access.log 
```



Nginx 重启

```linux
nginx -s reload
systemctl reload nginx.service
```

Nginx 检查

```
nginx -t
```



多级代理

如果将真实的参数通过代理传递到真正的服务器

- 参数
- http_x_forwarded_for = 客户端id, 代理ip, 代理ip



#### 核心模块

##### 监控nginx客户端状态

```

mv default.conf status.conf
vi status.conf

```

```nginx
// 展示nginx状态
server {
  location = /status {
    stub_status on;
  }
}

nginx -s reload
```

##### 随机主页

```nginx
mkdir html
echo 1 > 1.html
echo 2 > 2.html
echo 3 > 3.html
cp status.conf status.conf.bak
```

```nginx
server {
  location / {
    root /data/html;
    random_index on;
  }
}
```

添加权限

```
chmod -R 777 /data
```

##### 内容替换

> --with-http_sub_module 

```nginx
server {
  location / {
    root /usr/share/nginx/html;
    index index index.html;
    sub_filter 'word' 'zhufeng';
    sub_filter_once off;
  }
}
```

##### ab

```
ab -n 40 -c 20 http://localhost/
```

##### 取到ip地址

```
ifconfig
```

#### 请求限制

Limit_req_zone

```nginx
limit_req_zone key zone=name:siz  e rate=rate(每秒多少次)
```

示例：

```nginx
mv status.conf limit.conf


limit_req_zone $binary_remote_addr zone=req_zone:10m rate=1r/s;

server {
  # 缓存队列burst=3个， 放入到缓存中， 并发处理rate+burst个
  limit_req zone=req_zone burst=3 nodelay;
}
```

常见变量

- $binary_remote_addr 表示远程的IP地址
- zone=req_zone:10m 表示一个内存区域带下为10M， 并且设定了名称为req_zone
- zone=req_zone 表示这个参数对应的全局设置就是req_zone的那个区域
- rate=1r/s 表示请求的速率是一秒一个请求
- burst=3 表示请求队列的长度
- Nodally 表示不延时

##### 链接限制

Limit_conn_zone

```nginx
# 语法： limit_conn_zone key zone=name:size;
# 语法： limit_conn zone number
```

示例：

```nginx
limit_conn_zone $binary_remote_addr zone=conn_zone:10m;

server {
  location / {
    limit_conn conn_zone 1;c
  }
}
```

##### 访问控制

- 基于IP的访问控制 http_access_module
- 基于用户的信任登陆 http_auth_basic_module

1. http_access_module

```nginx
# 语法： allow address | all;
#       deny address|CIDR|all;
```

示例：

```nginx
cp limit.conf limit.conf.back
mv limit.conf access.conf

server {
  location ~ ^/admin.html {
    deny 192.168.0.104;
    allow all;
    root /usr/share/html/
  }
}

cd /usr/share
touch admin.html
```

