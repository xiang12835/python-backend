## MicroSummer

### 功能

- 后端接口
- 后台管理系统
- 后台脚本

### 目录

- base : Django 配置
- script : 后台脚本
- user : 用户模块
- manage.py : Django 启动

### 环境

- Python 3.7
- Django 2.2

pip install django==2.2.25

- djangorestframework 3.9.2

pip install djangorestframework==3.9.2

- django-rest-swagger 2.2.0

pip install django-rest-swagger==2.2.0

- sqlite3 (可替换成 MySql 或其他数据库)

### 迁移数据库

python3 manage.py makemigrations

python3 manage.py migrate

### 创建超级用户

python3 manage.py createsuperuser

### 运行

```
python3 manage.py runserver 127.0.0.1:8000
```

### 访问

```
http://127.0.0.1:8000 首页
http://127.0.0.1:8000/admin 后台管理系统
http://127.0.0.1:8000/doc 接口文档
```

### 参考

- [Django rest_framework实现增删改查接口](https://www.cnblogs.com/ghylpb/p/12115512.html)
