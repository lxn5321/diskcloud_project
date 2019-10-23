# 系统要求：
1.拥有python 3.7.3  
2.拥有Mariadb 10.x或Mysql 8.0.x
***
# 调试步骤:
1. 使用python的venv模块新建并进入虚拟环境（可选）
2. 使用`pip install -r requirement.txt`安装所需依赖
3. 将/diskcloud/config/debug_config_example.py重命名为debug_config.py,再将其内的MYSQL_USERNAME的值更改为数据库的用户名，MYSQL_PASSWORD的值更改为数据库的密码。详细配置请参考[配置文件说明]章节。
4. 修改本地的host文件，添加一行"127.0.0.1 test.com"。该指令用于将'test.com'这个域名重定向到本地，用于本地测试。
5. 终端输入`flask init_db`来初始化数据库，`flask init_db --force`来覆盖已存在的数据库，
6. 终端输入`flask run`来启动本系统。浏览器登录'test.com/foo'来进行访问。
***
# 部署步骤:
1. 使用python的venv模块新建并进入虚拟环境（可选）
2. 使用`pip install -r requirement.txt`安装所需依赖
3. 将/diskcloud/config/config.py重命名为production_config.py,再将其内的MYSQL_USERNAME的值更改为数据库的用户名，MYSQL_PASSWORD的值更改为数据库的密码，MYSQL_HOST的值更改数据库服务器所在的IP，SESSION_COOKIE_DOMAIN的值更改为网站的域名。详细配置请参考[配置文件说明]章节。
4. 终端输入`flask init_db`来初始化数据库，`flask init_db --force`来覆盖已存在的数据库。
5. 按照[Flask部署选项](http://flask.pocoo.org/docs/1.0/deploying/)此教程进行服务器部署。/diskcloud/instance.py:app为应用入口。
***
# 配置文件说明:
### SECRET_KEY
主要用来加密session和cookie,生产中请设置为一个尽可能复杂的随机字节。建议生产中不要使用默认值。
### TESTING
应用出现错误时，是否在返回一个stack trace网页来排查错误，建议在测试环境中开启，生产环境中关闭。
### MYSQL_HOST
数据库服务器所在的IP，默认为127.0.0.1。
### MYSQL_USERNAME
访问数据库服务器的用户名。
### MYSQL_PASSWORD
访问数据库服务器的密码。
### SESSION_COOKIE_DOMAIN
设置cookie和session所属的域名
### SESSION_COOKIE_PATH
设置cookie和session所属的地址
### COOKIE_LIFETIME
设置cookie的存活时间
### SESSION_COOKIE_SECURE
设置cookie和session的secure属性
### SESSION_COOKIE_HTTPONLY
设置cookie和session的httponly属性
### SESSION_COOKIE_SAMESITE
设置cookie和session的samesite属性
### PERMANENT_SESSION_LIFETI
设置后端服务器配置的session存活时间，不设置表示用户退出浏览器后自动清除session，默认不设置。
### SEND_FILE_MAX_AGE_DEFAULT
设置send_file()函数发送的文件的缓存时间，默认为24小时。
### NGINX_X_ACCEL_REDIRECT
设置nginx的x-accel的路径，详情查看Nginx的[X-Accel教程](https://www.nginx.com/resources/wiki/start/topics/examples/x-accel/)。
### FILES_FOLDER
设置网盘的文件存放位置
### CAN_REGISTER
设置注册功能是否开放
