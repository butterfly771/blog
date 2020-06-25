## Nginx实战 

#### 静态资源web服务器



### CDN

cdn的全称是 Content Delivery Network, 即内容分发网络。

```nginx
sendfile on; 
tcp_nopush on 
```

压缩 gzip

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

![image-20200607145042859](/Users/yueqi/Desktop/document/nginx/image-20200607145042859.png)

#### 跨域

```nginx
server {
  location ~ .*\.json$ {
    add_header Access-Control-Allow-Origin http://localhost:3000;
    add_header Access-Control-Allow-Methods GET, POST, PUT, DELETE, OPTIONS;
    root /data/json;
  }
}
```

#### 防盗链

- 防止网络资源被盗用
- 保证信息安全
- 防止流量过量

```nginx
location ~ .*\.(jpg|png|gif)$ {
  valid_referers nono blocked 47.104.184.134;
  if ($invalid_referer) { # 验证通过为0， 不通过为1
    return 403
  }
} 
```

#### 代理服务

Props_pass

- 正向代理

  正向代理的对象是客户端， 服务器端看不到真正的客户端， 例如公司局域网内访问外网

- 反向代理

  反向代理代理的对象是服务端， 客户端看不到真正的服务端 nginx代理应用服务器

示例：

1. 正向代理

```nginx
server_name www.yueqi.com;
resolver 8.8.8.8; # 谷歌的域名解析地址
server {
  location / {
    proxy_pass http://$http_host$request_uri;
  }
}
```

2. 反向代理

```nginx
location ~ ^/api {
  proxy_pass http://localhost:3000;
  proxy_redirect default; #重定向
  
  proxy_set_header Host $http_host; #向后传递头信息
  proxy_set_header X-Real-IP $remote_addr; #把真实IP传给应用服务器
}
```



#### 负载均衡

- 使用集群是网站解决高并发、海量数据的问题的常用手段。
- 当一台服务器的处理能力、存储空间不足时， 不要企图去换更强大的服务器， 对大型网站而言， 不管多么强大的服务器， 都满足不了网站持续增长的业务需求。
- 这种情况下， 更恰当的做法是增加一台服务器分担原油服务器的访问及存储压力。通过负载均衡调度服务器， 将来自浏览器的访问请求分发到应用服务器集群中的任何一台服务器上吗如果有更多的用户， 就在集群中加入更多的应用服务器， 使应用服务器的负载压力不再成为整个网站的瓶颈

Upstream

语法： upstream name {}

Upstream 服务池

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
upstream zfpx {
  server localhost:3000 down;
  server localhost:4000 backup;
  server localhost:5000 max_fails=1 fail_timeout=10s;
}
```

Kill -9 10826

![image-20200607210927446](/Users/yueqi/Library/Application Support/typora-user-images/image-20200607210927446.png)