## Nginx基础

> 前言

记录一下自己学习nginx的过程

#### nginx简介

1. nginx是什么？

   nginx 是一个免费的，开源的，高性能的HTTP服务器和反向代理，以及IMAP / POP3代理服务器。

2. nginx主要有哪些**应用场景**？

   - 静态资源服务器
   - 反向代理服务器
   - api接口服务器： 权限控制， 缓存， 访问数据库。

3. nginx的优势

   高并发高性能、可拓展性号、高可靠性、热部署、开源许可证

#### 安装nginx 

下面介绍在linux系统下安装nginx(centos7)。

首先， 需要关闭系统防火墙

```sh
systemctl disable firewalld.service
```

安装基础的依赖

```shell
yum -y install gcc gcc-c++ autoconf pcre pcre-devel make authmake
yum -y install wget httpd-tools vim
```

修改yum源

https://nginx.org/en/linux_packages.html#RHEL-CentOS

```shell
vim /etc/yum.repos.d/nginx.repo

# 文件
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/7/$basearch/
gpgcheck=0
enabled=1
```

查看可安装列表

```shell
yum list | grep nginx
```

Nginx 启动， 重载

```shell
systemctl reload nginx.service
# 或者
nginx -s reload
```

查看nginx进程

```shell
ps -ef | grep nginx
```

查看nginx日志

```shell
tail -f /var/log/nginx/access.log 
tail -f /var/log/nginx/error.log 
```

Nginx 检查

```shell
nginx -t
```



#### nginx配置文件

这里介绍nginx的配置文件

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
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" 
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



#### nginx实战

> ###### 代理服务 proxy_pass

代理分为两种， 正向代理和反向代理

- 正向代理

  正向代理的对象是客户端， 服务端看不到真正的客户端， 例如公司局域网内访问外网。

- 反向代理

  反向代理的对象是服务端， 客户端看不到真正的服务端nginx代理应用服务器

示例:

 1. 正向代理: 

    ```nginx
    server_name www.yueqi.com;
    resolver 8.8.8.8; # 谷歌的域名解析地址
    server {
      location / {
        proxy_pass http://$http_host$request_uri;
      }
    }
    ```

	2. 反向代理：让客户端发起的请求使用nginx转发到localhost:3000端口

    ```nginx
    location ~ ^/api {
      proxy_pass http://localhost:3000;
      proxy_redirect default; #重定向
      
      proxy_set_header Host $http_host; #向后传递头信息
      proxy_set_header X-Real-IP $remote_addr; #把真实IP传给应用服务器
    }
    ```

> ###### 负载均衡

Upstream

语法： upstream name {}

Upstream 服务池

- 使用集群是网站解决高并发、海量数据的问题的常用手段。
- 当一台服务器的处理能力、存储空间不足时， 不要企图去换更强大的服务器， 对大型网站而言， 不管多么强大的服务器， 都满足不了网站持续增长的业务需求。
- 这种情况下， 更恰当的做法是增加一台服务器分担原油服务器的访问及存储压力。通过负载均衡调度服务器， 将来自浏览器的访问请求分发到应用服务器集群中的任何一台服务器上吗如果有更多的用户， 就在集群中加入更多的应用服务器， 使应用服务器的负载压力不再成为整个网站的瓶颈

```nginx
upstream yueqi {
  server 127.0.0.1:3000 weight=10;
  server 127.0.0.1:4000;
  server 127.0.0.1:5000;
}

server {
  location / {
    proxy_passhttp://yueqi;
  }
}
```

后台服务器状态

- down 当前服务器不赞誉负载均衡
- Backup 当其它节点都无法使用时的备份的服务器
- Max_fails 允许请求失败的次数， 到达最大次数就会休眠
- Fail_timeout 经过max_fails失败后， 服务器暂停的时间， 默认10s
- Max_conns 限制每个server最大的接受的连接数， 性能高的服务器可以连接数多一些。

```nginx
upstream yueqi {
  server localhost:3000 down;
  server localhost:4000 backup;
  server localhost:5000 max_fails=1 fail_timeout=10s;
}
```

> ###### 跨域

通过给nginx设置转发头解决跨域问题

```nginx
server {
  location ~ .*\.json$ {
    add_header Access-Control-Allow-Origin http://localhost:3000;
    add_header Access-Control-Allow-Methods GET, POST, PUT, DELETE, OPTIONS;
    root /data/json;
  }
}
```

> ###### 压缩 gzip

```nginx
cp static.conf static.conf.back
mv static.conf gzip.conf
server {
  location ~ .*\.(jpg|png|gif) {
    gzip off;
    root /usr/share/nginx/html;
  }
  
  location ~ .*\.(html|js|css) {
    gzip on;
    gizp_min_length 1k;
    gzip_http_version 1.1; # http协议版本1.1以上
    gizp_comp_level 9; # 压缩级别
    gzip_types text/css application/javascript; 
    root /usr/share/nginx/html;
  }
  
  location ~ ^/download {
    gzip_static on; # 
    tcp_nopush on; # 延迟推送
    root /usr/share/nginx/html;
  }
}
```

> ###### 请求限制

属性： limit_req_zone

语法：

```nginx
limit_req_zone key zone=name:siz  e rate=rate(每秒多少次)
```

示例：

```nginx
# mv status.conf limit.conf

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

> 链接限制

属性： limit_conn_zone

语法： 

```nginx
limit_conn_zone key zone=name:size;
limit_conn zone number
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

> ###### 访问控制

- 基于IP的访问控制 http_access_module
- 基于用户的信任登陆 http_auth_basic_module

语法：

```nginx
#  allow address | all;
#  deny address|CIDR|all;
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



补充知识

nginx采用单线程，多进程，和多路IO复用模型（node）

补充知识：

1. 进程和线程

   进程是分配资源的最小单位， 一个进程可以有多个线程在工作。

   线程 更加轻量级， 可以随时销毁。

2. I/O多路复用

   多个文件描述符的I/O操作都能在一个线程里面并发交替顺序完成。 复用线程。

3. I/O模式

   对于一次I/O访问， 数据会线拷贝到操作系统内核的缓冲区中， 然后才会从操作系统内核的缓冲区拷贝到应用程序的缓冲区， 最后交给进程。 所以， 当一次I/O操作发生时， 它会经历两个阶段： 

   - a. 等待数据准备
   - b. 将数据从内核拷贝到进程中