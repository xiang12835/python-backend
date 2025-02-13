﻿#encoding = utf-8
import threading
from redis import Redis
#from django.conf import settings
#memcache_settings = settings.memcache_settings
#redis_settings = settings.redis_settings
#import setting
#from settings import memcache_settings,redis_settings
from django.conf import settings
import logging

try:
    redis_settings = settings.redis_settings
except:
    redis_settings = {
    "REDIS_BACKEND": {"servers": 'localhost', "port": 6379, "db": 11},
    "MQUEUE_BACKEND": {"servers": 'localhost', "port": 6379, "db": 12},
    "Redis_Source_Use_MongoDB": False  #if redis down use mongodb
    }


class RedisClient(object):
    instance = None
    locker = threading.Lock()

    def __init__(self):
        """ intialize the client of redis  include port db and servers """
        try:
            config = redis_settings["REDIS_BACKEND"]
            self.servers = config["servers"]
            self.port = config["port"]
            self.db = config["db"]
            self.password = config.get("password",'')
            self.redis = Redis(self.servers, self.port, self.db , password=self.password)
        except Exception as e:
            print("Redis YAMLConfig Error :", e)

        #获得单列对象

    @classmethod
    def getInstance(klass):
        """
get the instance of RedisClient
return:
    the redis client
"""
        klass.locker.acquire()
        try:
            if not klass.instance:
                klass.instance = klass()
            return klass.instance
        finally:
            klass.locker.release()

    def reconnect(self):
        """
        if the connetion is disconnet  then connect again
"""
        try:
            self.redis = Redis(self.servers, self.port, self.db, password=self.password)
        except Exception as e:
            logging.error(e)


class RQueueClient(RedisClient):
    instance = None

    def __init__(self):
        """ intialize the client of redis  include port db and servers """
        try:
            config = redis_settings["MQUEUE_BACKEND"]
            self.servers = config["servers"]
            self.port = config["port"]
            self.db = config["db"]
            self.password = config.get("password",'')
            self.redis = Redis(self.servers, self.port, self.db , password=self.password)
        except Exception as e:
            logging.error(e)




class DeviceRedisClient(object):
    instance = None
    locker = threading.Lock()

    def __init__(self):
        """ intialize the client of redis  include port db and servers """
        try:
            config = redis_settings["DEVICE_REDIS_BACKEND"]
            self.servers = config["servers"]
            self.port = config["port"]
            self.db = config["db"]
            self.password = config.get("password",'')
            self.redis = Redis(self.servers, self.port, self.db , password=self.password)
        except Exception as e:
            print("Redis YAMLConfig Error :", e)

        #获得单列对象

    @classmethod
    def getInstance(klass):
        """
get the instance of RedisClient
return:
    the redis client
"""
        klass.locker.acquire()
        try:
            if not klass.instance:
                klass.instance = klass()
            return klass.instance
        finally:
            klass.locker.release()

    def reconnect(self):
        """
        if the connetion is disconnet  then connect again
"""
        try:
            self.redis = Redis(self.servers, self.port, self.db, password=self.password)
        except Exception as e:
            logging.error(e)


