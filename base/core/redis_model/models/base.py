﻿#coding=utf-8

import time
from datetime import datetime, date
import json
import types
from attributes import *
from mfilter import ModelSet
from base.core.redis_model.redis_client import RedisClient
import json

#加载配置
import setting
from setting import logger


"""
研究方向
python 面向对象方向
http://pypi.python.org/pypi/redisco/0.1.dev22

django 结合方向
http://github.com/sebleier/django-redis-cache
http://hg.gomaa.us/agdj/file/tip/agdj/lib/redis_session_backend.py


设计思想：
class User:
    username = stringField(index = true)
    sex = stringField()
    
    1.find(username = 'liuzheng')
    2.In Redis DB (User:username:liuzheng , id)
    3.now find id , by id find(id=id)
    4.data = get("User:id")
    5.attributes = json.load(data)
    6.return object(attributes)
"""


class ModelBase(type):

    """Metaclass of the Model."""
    def __init__(cls, name, bases, attrs):
        """
        intialize name base modle  attribute
        param:
            name:string
            bases:base model
            attrs: attribute
        """
        super(ModelBase, cls).__init__(name, bases, attrs)
        cls._initialize_attributes(cls, name, bases, attrs)
        cls._initialize_manager(cls)
    
    def _initialize_attributes(self,model_class, name, bases, attrs):
        """
        Initialize the attributes of the model.
        param:
            model_class:object
            name:string
            bases:base model
            attrs:attribute
        """
        #主要功能：添加属性列表
        model_class.attributes = {}
        for k, v in attrs.iteritems():
            if isinstance(v,Attribute):
                    model_class.attributes[k] = v
                    v.name = v.name or k
    
    
    def _initialize_manager(self,model_class):
        """
        Initializes the objects manager attribute of the model.
        param:
            model_class:object
        """
        model_class.objects = ModelSet(model_class)
        pass



class Model(object):
    __metaclass__ = ModelBase
    
    #################
    # Initialize #
    #################
    
    def __init__(self, **kwargs):
        """
        initialize _errors is empty list
        """
        self._errors = []
        self.update_attributes(**kwargs)
        #self._point_attributes()
    
    def _point_attributes(self):
        """
        set the attribute point to self
        """
        #主要功能： 设置attribute 指向自己
        for k, v in self.attributes.iteritems():
            if isinstance(v,ListField) or isinstance(v,SetField) or isinstance(v,SortSetField):
                t = v.__class__()
                t.__dict__.update(v.__dict__)
                t.bo  = self
                setattr(self,t.name,t)

    def update_attributes(self, **kwargs):
        """
        Updates the attributes of the model.
        param:
            **kwargs:
                id: integer
        """
        if kwargs:
            self.id = kwargs.get("id",0)
            attrs = self.attributes.values()
            for att in attrs:
                if att.name in kwargs:
                    att.set(self,kwargs[att.name])


    #################
    # Instance Methods #
    #################
    
    ###############################Start Key Field #################################
    def primary_key(self):
        """
        get the primary key
        return:
            string
        """
        return "%(prefix)s:pid" % {"prefix":self.__class__.__name__}
    

    def key(self,name):
        """
        added lock  when Synchronization
        param:
            name:string
        return:
            string
        """
        return "%(prefix)s:%(name)s" % {"prefix":self.__class__.__name__,"name":name}

    @classmethod
    def index_name(cls,attrname):
        """
        produce name of attribute index table  when index = True
        for example：User:username:index
        param:
            attrname:attribute name
        return:
            string
        """
        return "%(prefix)s:%(attrname)s:index" % {"prefix":cls.__name__,"attrname":attrname}
    
    def index_list(self):
        """
        produce name of attribute index table  when index = True
        for example：User:1:indexes
        return:
            string
        """
        return "%(prefix)s:%(id)s:indexes" % {"prefix":self.__class__.__name__,"id":self.id}

    def dump_key(self):
        """
        produce field dump key
        for example：User:id
        return:
            string
        """
        return "%(prefix)s:%(id)s:fields" % {"prefix":self.__class__.__name__,"id":self.id}

    @classmethod
    def dump_fields_key(klass,id):
        """
        produce field dump key
        for example：User:id
        return:
            string
        """
        return "%(prefix)s:%(id)s:fields" % {"prefix":klass.__name__,"id":id}
    
    @classmethod
    def list_key(cls):
        """
        produce field List key
        for example：User
        return:
            string
        """
        return "%(prefix)s:list" % {"prefix": cls.__name__ }
    
    ###############################End Key Field #################################

    def save(self,pfields=None,new = False):
        n  =  datetime.now()
        """
        Saves the instance to the datastore Redis!
        params :
        pfields for partial fields save
        pfields = ("username","gender")
        param:
            pfields:object the default is None
            new:True or False
        return:
            True or False
        """
        #清空错误列表
        self._errors = []
        #检查字段的有效性
        if pfields:
            if not isinstance(pfields,tuple):
                self._errors.append("params must tuple list!")
                return False
            for p in pfields:
                if not self.attributes.has_key(p):
                    self._errors.append("%s field not exists!" % p)
                    return False
            
        #检查每个字段的有效性
        if not self.is_valid():
            return False
        #这个如果不是New 要生成一个ID
        if new:
            _new = True
        else:
            _new = self.is_new()
        
        if _new and not new and not self.id:
            self._initialize_id()
        
        #这里可以应用到分布式
        #with Mutex(self):
        self._write(_new,pfields)
        
        logger.info("save type:%s, id:%s ,use: %s" % (self.__class__.__name__,self.id,datetime.now() - n))
        return True
    
    
    def drop_index(self,pipe,pfields=None):
        """
        delete the source index
        param:
            pipe:redis pipe
            pfields:object default is None
        """
        #1.删除 原有Index
        indexes_key = self.index_list()
        #1.1循环删除
        ls = self.db.lrange(indexes_key,0,-1)
        for indexv in ls:
            field,name =  indexv.split('|')
            if pfields:
                #只删除需要保存的索引
                fname = name.split(":")[1]
                if pfields.count(fname) > 0:
                    pipe.hdel(name,field)
                    pipe.lrem(indexes_key,indexv)
            else:
                #没有要保存的字段，全部删除
                pipe.hdel(name,field)

        #1.2 删除 Index
        if not pfields:
            pipe.delete(indexes_key)
    
    def delete(self):
        """
        delete the data of object use pipe
        delete index delete data of user
        """
        n = datetime.now()
        #注册事务
        pipe = self.db.pipeline()
        try:
            #1.删除索引
            self.drop_index(pipe)

            #2.删除用户数据
            pipe.delete(self.dump_key())
            
            #3.删除用户列表中对应的用户
            pipe.lrem(self.__class__.list_key(),0,self.id)
            self.change_log(None,pipe,"delete")
            #提交到Redis 数据库
            pipe.execute()
            logger.info("delete type:%s, id:%s ,use: %s" % (self.__class__.__name__,self.id,datetime.now() - n))
        except Exception,e:
            pipe.reset()
            logger.error(str(e))
            raise e


    def is_new(self):
        """
        Returns True if the instance is new.
        Newness is based on the presence of the _id attribute.
        return:
            True or False
        """
        return not hasattr(self, '_id')

    
    
    #################
    # Validate Methods #
    #################
    def is_valid(self):
        """
        Returns True if all the fields are valid.
        return:
            True or False
        """
        self._errors = []
        for key,field in self.attributes.iteritems():
            field.validate(self)
        self.validate()
        return not bool(self._errors)
  

    def validate(self):
        """
        Overriden in the model class.
        Do custom validation here. Add tuples to self._errors.
        Example:
            class Person(Model):
                name = StringField(required=True)
                def validate(self):
                    if name == 'Nemo':
                        self._errors.append(('name', 'cannot be Nemo'))
        """
        pass
    
    
    #################
    # Attributes #
    #################
    @property
    def id(self):
        """
        get the id of object
        return:
            id:integer
        """
        if not hasattr(self, '_id'):
            return None
        else:
            return int(self._id)
    
    
    @id.setter
    def id(self, val):
        """
        Returns the id of the instance as a string.
        param:
            val:integer
        """
        self._id = str(val)


    @property
    def db(cls):
        """
        Returns the Redis client used by the model.
        retrun:
            database client
        """
        return RedisClient.getInstance().redis

    @property
    def errors(self):
        """
        Returns the list of errors after validation.
        return:
            string
        """
        return self._errors
    
    #################
    # Class Methods #
    #################

    @classmethod
    def exists(cls, obj):
        """
        Checks if the model with id exists.
        param:
            obj:object
        return:
            True or False
        """ 
        return bool(cls.db.exists(obj.dump_key()))

    ###################
    # Private methods #
    ###################

    def _initialize_id(self):
        """
        Initializes the id of the instance.
        """
        pid = self.db.get(self.primary_key())
        if pid == 'None' or not pid:
            self.db.set(self.primary_key(),0)
        self.id = str(self.db.incr(self.primary_key()))
    
    def change_log(self,fields,pipe=None,_new=False):
        """
        save the change log
          insert: id , field ,value
                      update: id , field ,value
                      delete: id
        param:
            fields:string
            pipe:redis pipe
            _new:True or false
        """
        #是否启用数据同步
        if not setting.DATA_SYNC:
            return

        #初始化服务
        dp  = pipe or self.db
        if _new==True:
            oper = "insert"
        elif _new==False:
            oper = "update"
        else:
            oper = "delete"

        #保存chang_log
        if oper == "delete":
                val = "%(oper)s:_:%(model_type)s:_:%(id)s:_:%(value)s" % {"oper":oper,"model_type":self.__class__.__name__,"id":self.id,"value" : ""}
        else:
            if not fields:
                return
            sfileds = json.dumps(fields)
            val = "%(oper)s:_:%(model_type)s:_:%(id)s:_:%(value)s" % {"oper":oper,"model_type":self.__class__.__name__,"id":self.id,"value" : sfileds}
        logger.info("sync: " + val)
        #保存数据dao Redis List Queue
        pipe.lpush("change_log",val)
    
    
    def _write(self, _new=False,pfields=None):
        """
        save the value of fields into database
        param:
            _new:True or False
            pfields:object  the default is None
        """
        #注册事务
        pipe = self.db.pipeline()
        try:
            #1.删除索引
            self.drop_index(pipe,pfields)
            #2.保存用户信息
            # attributes 和 index
            indexes = {} #Index 批量处理
            fields = {} #StringField为属性
            #进行分类
            for k, v in self.attributes.iteritems():
                key = str(k)
                value = getattr(self, k)

                #检查是否有分类保存字段
                if pfields:
                    if not pfields.count(v.name) > 0:
                        #如果，该字段不需要保存，跳过
                        continue
                
                #这里只有StringField有 Index
                if isinstance(v,StringField):
                    if v.index:
                        #1，生成索引
                        #生成 user:username:index  == key
                        index_name = self.__class__.index_name(v.name)
                        #生成 field =  username.value
                        index_key = value
                        #保存  user:username:index ， yangqun , 1
                        pipe.hset(index_name,index_key,self.id)
                    
                        #2, 加入索引表
                        index_list_key = self.index_list()
                        index_list_value = "%s|%s" % (index_key,index_name)
                        pipe.lpush(index_list_key,index_list_value)

                    #将字段加入Hash，用于批量保存
                    fields[key] = v.typecast_for_storage(value)
                    

            #保存字段
            if fields:
                fields["id"] = self.id
                #这里Field使用String保存，序列化为Str
                pipe.hmset(self.dump_key(),fields)
                #添加change_log For Save
                self.change_log(fields,pipe,_new)
            #提交到Redis 数据库
            
            if _new:
                #添加到列表
                pipe.lpush(self.__class__.list_key(),self.id)

            pipe.execute()
        except Exception,e:
            pipe.reset()
            logger.error(str(e))
            raise e


        
        
class Mutex(object):
    """
    Implements locking so that other instances may not modify it.
    Code ported from Ohm.
    """

    def __init__(self, instance):
        """
        intialize instance
        param;
            instance:object
        """
        self.instance = instance

    def __enter__(self):
        """
        call lock method  and return self
        return:
            object
        """
        self.lock()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        """
        call unlock method
        """
        self.unlock()

    def lock(self):
        """
        lock object prevent Asynchronous operate
        """
        #print "lock"
        o = self.instance
        while not o.db.setnx(o.key('_lock'), self.lock_timeout):
            lock = o.db.get(o.key('_lock'))
            if not lock:
                continue
            if not self.lock_has_expired(lock):
                time.sleep(0.5)
                continue
            lock = o.db.getset(o.key('_lock'), self.lock_timeout)
            if not lock:
                break
            if self.lock_has_expired(lock):
                break

    def lock_has_expired(self, lock):
        """
        the deadline of lock
        param:
            lock:integer
        return:
            True or False
        """
        return float(lock) < time.time()

    def unlock(self):
        """
        unlock the object of key  then delete
        return:
            True or False
        """
        #print "unlock"
        self.instance.db.delete(self.instance.key('_lock'))

    @property
    def lock_timeout(self):
        """
        the timeout of lock
        return:
            string
        """
        return "%f" % (time.time() + 1.0)

    
def get_model_from_key(model_name):
    """
    Gets the model from a given key.
    param:
        model_name: name of model
    return:
        object
    """
    _known_models = {}
    #populate
    for klass in Model.__subclasses__():
        _known_models[klass.__name__] = klass
        
        for sub in klass.__subclasses__():
            _known_models[sub.__name__] = sub
        
    return _known_models.get(model_name, None)
