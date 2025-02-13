# -*- coding: utf-8 -*-
import logging
import time
import functools
import hashlib
import inspect
from django.conf import settings
from django.http import HttpResponse
#from django.utils import json

memcache_settings = settings.memcache_settings
import pickle

expire_default_time = 60 * 10

from . import memcache


def mc_cmd(func):
    def f(*args, **kwargs):
        self = args[0]
        result = None
        try:
            result = func(*args, **kwargs)
        except Exception as e:
            logging.error(e)
            if (self.old_libmc_version) and (
                time.time() - self.conn_time > self.retry_timeout):
                try:
                    self.conn()
                    result = func(*args, **kwargs)
                except Exception as e2:
                    logging.error(e2)
        return result
    return f

class Client(object):
    def __init__(self, servers):
        self._servers = servers

        try:
            import _pylibmc
            self.old_libmc_version = _pylibmc.libmemcached_version_hex < 0x01000003
        except:
            self.old_libmc_version = True

        self.conn()

    def conn(self):
        self._mc = self._conn(self._servers)

    def _conn(self, servers):
        behaviors = {
            'ketama': True,
            'no_block': True,
            'tcp_nodelay': True,
            'remove_failed': 3,
            '_retry_timeout': 1,
            'retry_timeout':1,
            'receive_timeout': 500,
            'send_timeout': 500,
            #Once a server has been marked dead, 
            #wait this amount of time (in seconds) before checking to see if the server is alive again.
            'dead_timeout': 1,
        }

        # 1.0.3之前的版本不支持dead_timeout，只能自己实现重连

        if self.old_libmc_version:
            del behaviors['dead_timeout']
            self.conn_time = time.time()
            self.retry_timeout = behaviors['_retry_timeout']

        mc = pylibmc.Client(servers, binary=True, behaviors=behaviors)
        return mc

    @staticmethod
    def _fix_key(key):
        if isinstance(key, unicode):
            key = key.encode('utf-8')
        return key

    def clone(self):
        u"""TODO: 还考虑处理线程安全"""
        return self

    @mc_cmd
    def add(self, key, value, time=expire_default_time):
        key = Client._fix_key(key)
        return self._mc.add(key, value, time)

    @mc_cmd
    def delete(self, key):
        key = Client._fix_key(key)
        return self._mc.delete(key)

    @mc_cmd
    def set(self, key, value, time=expire_default_time):
        key = Client._fix_key(key)
        return self._mc.set(key, value, time)

    @mc_cmd
    def set_multi(self, mapping, time=expire_default_time):
        new_mapping = {}
        for k, v in mapping.items():
            new_mapping[Client._fix_key(k)] = v
        return self._mc.set_multi(mapping, time)

    @mc_cmd
    def get(self, key):
        key = Client._fix_key(key)
        return self._mc.get(key)

    @mc_cmd
    def get_multi(self, keys):
        keys = [Client._fix_key(i) for i in keys]
        return self._mc.get_multi(keys)

    @mc_cmd
    def decr(self, key):
        key = Client._fix_key(key)
        return self._mc.decr(key)

    @mc_cmd
    def incr(self, key):
        key = Client._fix_key(key)
        return self._mc.incr(key)

    #live
    def get_random(self, key):
        key = Client._fix_key(key)
        return self._mc.get(key)

    def set_random(self, key, value, time=expire_default_time):
        key = Client._fix_key(key)
        return self._mc.set(key, value, time)


# FIXME: deprecated 以下为兼容代码

def mclient(servers):
    return Client(servers)

###################################################
#                   cache define                  #
###################################################
# master
func_cache =  memcache.Client(memcache_settings["func_cache"])
pool_model_cache = func_cache

user_cache =  func_cache
user_model_cache = func_cache
mfunc_cache = func_cache
muser_cache = func_cache
push_cache = func_cache
im_cache  = func_cache



class PyPoolUserMemcache(object):
    
    @classmethod
    def delete(cls, key, pool=user_model_cache):
        return muser_cache.delete(key)
        

    @classmethod
    def set(cls, key, value, time=expire_default_time, pool=user_model_cache):
        if not value:
            return
        v = pickle.dumps(value)
        #with pool.reserve() as _mc:
        result = muser_cache.set(key, v, time)
        #print result
        return result

    @classmethod
    def get(cls, key, pool=user_model_cache):
        result = muser_cache.get(key)
        if result:
            result = pickle.loads(result)
        else:
            return None
        return result



class PyPoolMemcache(object):
    @classmethod
    def incr(cls, key, pool=pool_model_cache):
        return mfunc_cache.incr(key)
        # with pool.reserve() as _mc:
        #     result = _mc.incr(key)
        # return result

    @classmethod
    def decr(cls, key, pool=pool_model_cache):
        return mfunc_cache.decr(key)
        # with pool.reserve() as _mc:
        #     result = _mc.decr(key)
        # return result

    @classmethod
    def add(cls, key, value, time=expire_default_time, pool=pool_model_cache):
        return mfunc_cache.add(key, value, time)
        # with pool.reserve() as _mc:
        #     result = _mc.add(key, value, time)
        # return result

    @classmethod
    def delete(cls, key, pool=pool_model_cache):
        return mfunc_cache.delete(key)
        # with pool.reserve() as _mc:
        #     result = _mc.delete(key)
        # return result

    @classmethod
    def set(cls, key, value, time=expire_default_time, pool=pool_model_cache):
        if not value:
            return

        v = pickle.dumps(value)
        return mfunc_cache.set(key, v, time)
        # with pool.reserve() as _mc:
        #     result = _mc.set(key, v, time)
        #     #print result
        # return result

    @classmethod
    def set_multi(cls, mapping, time=expire_default_time, pool=pool_model_cache):
        with pool.reserve() as _mc:
            result = _mc.set_multi(mapping, time)
        return result

    @classmethod
    def get(cls, key, pool=pool_model_cache):
        result = mfunc_cache.get(key)

        if result:
            try:
                result = pickle.loads(result)
            except Exception as e:
                logging.error(e)
                return None
        else:
            return None

        return result

    @classmethod
    def get_multi(cls, keys, pool=pool_model_cache):
        with pool.reserve() as _mc:
            result = _mc.get_multi(keys)

        return result


def get_plus_json(key, func, expire_m=None, expire_s=None, is_update=False, set_retry=True, not_valid_check={}):
    key_expire_name = "api.expired_at"
    raw_content = None

    if not is_update:
        n = time.time()
        content = PyPoolMemcache.get(key)

        try:
            if str(content) == "dataapi.expired_at":
                logging.error("[cache] is dataapi.expired_at : %s" % key)
        except Exception as e:
            logging.error(e)

        try:
            u = time.time() - n
            if u > 1:
                logging.error("get key %s use %s", key, u)
        except Exception as e:
            pass

        if content:
            if isinstance(content, dict) and content.has_key(key_expire_name):
                if content.get(key_expire_name) > int(time.time()):
                    #cache not expired
                    logging.debug("get key from cache:%s" % key)
                    return [content, ]
                else:
                    #cache expired,need to get new one
                    #if get new key exception use old one
                    logging.debug("expired %s" % key)
                    raw_content = content
            else:
                #list not support expired.at
                return content


    def get_and_set():
        try:
            #get result from origin function
            result = func()
            if result:
                #new version key result
                #{
                #   "api.body" : xxxxx
                #   "api.expire" :  1363672663
                #}
                valid = True
                if not_valid_check:
                    if isinstance(result, list):
                        for r in result:
                            for k, v in not_valid_check.iteritems():
                                if r.get(k) == v:
                                    valid = False
                                    break

                if valid:
                    logging.debug("set new version data")


                    data = {key_expire_name: int(time.time() + expire_m)}
                    for r in result:
                        if isinstance(r,dict):
                            data.update(r)
                        else:
                            data = result
                            break

                    logging.debug("get data add set key:%s" % key)
                    PyPoolMemcache.set(key, data, expire_s)

                    if isinstance(data,dict):
                        return [data, ]
                    else:
                        return data
        except Exception as e:
            import traceback
            exstr = traceback.format_exc()
            logging.error(e)
            logging.error(exstr)

            if raw_content:
                logging.debug("exception use old key:%s" % key)
                if set_retry:
                    #set 10 minute retry
                    data = raw_content
                    if isinstance(result, dict):
                        data.update({key_expire_name: int(time.time() + settings.cache_expire_15M)})

                    PyPoolMemcache.set(key, data, expire_s)
                return [raw_content, ]
            else:
                #must be evctions or old key
                logging.error(e)
                raise e


    #default pool0 one hour after be expired.
    expire_m = expire_m or settings.cache_expire_1H
    #expire_m = 3 for test
    #2h not expire
    expire_s = expire_s or expire_m + settings.cache_expire_2H
    #key for mutex
    key_mutex = '%s_mutex' % key

    if PyPoolMemcache.add(key_mutex, 1, settings.cache_expire_1M):
        #only allow one
        logging.debug("*mutex: %s" % key_mutex)
        try:
            raw_content = get_and_set()
        finally:
            logging.debug("delete mutex key:%s" % key_mutex)
            #delate mutex key
            PyPoolMemcache.delete(key_mutex)
    else:
        #on key expire be mutex go here use old key to return
        logging.debug("*mutex locked: %s" % key)

        if not raw_content:
            #retry to get from func() ,normally not go here ,must be evictions
            logging.debug("* evictions: %s" % key)
            import timeit

            n = timeit.default_timer()
            raw_content = get_and_set()
            spend = timeit.default_timer() - n
            #todo logging.error spend url
            logging.error("* evictions: %s %s" % (func.func_closure[0].cell_contents.request.path, spend))

    return raw_content


def _encode_cache_key(k):
    if isinstance(k, (bool, int, long, float, str)):
        return str(k)
    elif isinstance(k, unicode):
        return k.encode('utf-8')
    elif isinstance(k, dict):
        import urllib

        for x in k.keys():
            k[x] = _encode_cache_key(k[x])
        return urllib.urlencode(sorted(k.items()), True)
    else:
        return repr(k)


def function_cache(cache_keys="", prefix='api#phone', suffix='fun', expire_time=60 * 60, is_update_cache='', extkws={}):
    u"""
      cache_keys：缓存取那些参数当key,key之间用豆号分割,空就是用函数所有参数
      prefix:前缀，suffix：后缀
      expire_time：缓存时间，defaut time 30'm
      is_update_cache="YES" or '' ，是否马上更新缓存,空到expire_time才更新缓存
      extkws={},追加缓存参数,同名覆盖缓存参数
      is_obd:"YES" or '' ,缓存运营管理
       生成ckey的长度len不超过200
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            cache_keys_list = []
            custom_is_update_cache = kwargs.get('is_update_cache', '').upper() == 'YES'
            kwargs.pop('is_update_cache', None)
            if cache_keys:
                cache_keys_list = cache_keys.split(',')
                cache_keys_list = [ele.strip() for ele in cache_keys_list]
            arg_names, varargs, varkw, defaults = inspect.getargspec(func)
            #defaults
            _defargs = dict(zip(arg_names[-len(defaults):], defaults)) if defaults else {}
            _args1 = dict(zip(arg_names, args))
            _kwds = dict(_defargs, **_args1)
            _kwds.update(kwargs)
            _kwds.update(extkws)
            otheragrs = []
            if varargs:
                tmp = _args1.values()
                otheragrs = [v for v in args if v not in tmp]
                if otheragrs:
                    for i in xrange(0, len(otheragrs)):
                        _k = "_arg{}".format(i)
                        _kwds[_k] = otheragrs[i]

            if cache_keys_list:
                for k, v in _kwds.items():
                    if k not in cache_keys_list:
                        _kwds.pop(k, None)
            ckey = ""
            if _kwds:
                ckey = _encode_cache_key(_kwds)

            ckey = "{}#{}#{}".format(prefix, ckey, suffix)
            #logging.error(ckey)
            ckey = hashlib.md5(ckey).hexdigest()

            if len(ckey) > 200:
                ckey = ckey[:200]

            try:
                #print 'ckey:', ckey
                #print PyPoolMemcache.get(ckey)
                value = None if custom_is_update_cache else PyPoolMemcache.get(ckey)
                #logging.error(value)
                #print value
                if value is None:
                    # TODO: to fix: need save None
                    if custom_is_update_cache:
                        kwargs['is_update_cache'] = 'YES'
                    value = func(*args, **kwargs)
                    #print ckey,value,expire_time
                    # if value:
                    #import logging.error(value)

                    #logging.error(value)
                    PyPoolMemcache.set(ckey, value, expire_time)

                return value
            except Exception as e:
                if custom_is_update_cache:
                    kwargs['is_update_cache'] = 'YES'
                return func(*args, **kwargs)

        wrapper.original_function = func
        wrapper.func_name = func.func_name
        wrapper.__doc__ = func.__doc__
        return wrapper

    return decorator


def page_static_cache(timeout=60 * 60 * 1, content_type="text/html", user_cache=True, host_cache=True, key_prefix=True):
    """
    page cache
    param:
        timeout:the deadline of cache  default is 1800
    """
    #from base.core import dateutils

    def _func(func):
        def wrap(request, *a, **kw):
            key = request.get_full_path()
            try:
                key = key.encode("utf-8")
            except Exception as e:
                key = str(key)

            #if key_prefix:
            #    key = "%s:%s" % (dateutils.zero_date().strftime('%Y-%m-%d'), key)

            # if user_cache:
            #     key = "%s:%s" % (key, request.user.id)

            # if host_cache:
            #     key = "%s:%s" % (key, request.get_host())

            #logging.error("form get key:%s" % key)
            

            key = hashlib.md5(key).hexdigest()
            logging.error("*form get key:%s ,debug:%s" % (key,settings.DEBUG))
            
            response = PyPoolMemcache.get(key)
            logging.error("response %s:" % response)

            if not response or settings.DEBUG:
                response = func(request, *a, **kw)
                if response:
                    logging.error("form set key:%s" % key)
                    PyPoolMemcache.set(key, response, timeout)
            else:
                logging.error("form get key:%s" % key)

            return response
        return wrap

    return _func



def function_im_cache(cache_keys="", prefix='api#phone', suffix='fun', expire_time=60 * 60, is_update_cache='', extkws={}):
    u"""
      cache_keys：缓存取那些参数当key,key之间用豆号分割,空就是用函数所有参数
      prefix:前缀，suffix：后缀
      expire_time：缓存时间，defaut time 30'm
      is_update_cache="YES" or '' ，是否马上更新缓存,空到expire_time才更新缓存
      extkws={},追加缓存参数,同名覆盖缓存参数
      is_obd:"YES" or '' ,缓存运营管理
       生成ckey的长度len不超过200
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            cache_keys_list = []
            custom_is_update_cache = kwargs.get('is_update_cache', '').upper() == 'YES'
            kwargs.pop('is_update_cache', None)
            if cache_keys:
                cache_keys_list = cache_keys.split(',')
                cache_keys_list = [ele.strip() for ele in cache_keys_list]
            arg_names, varargs, varkw, defaults = inspect.getargspec(func)
            #defaults
            _defargs = dict(zip(arg_names[-len(defaults):], defaults)) if defaults else {}
            _args1 = dict(zip(arg_names, args))
            _kwds = dict(_defargs, **_args1)
            _kwds.update(kwargs)
            _kwds.update(extkws)
            otheragrs = []
            if varargs:
                tmp = _args1.values()
                otheragrs = [v for v in args if v not in tmp]
                if otheragrs:
                    for i in xrange(0, len(otheragrs)):
                        _k = "_arg{}".format(i)
                        _kwds[_k] = otheragrs[i]

            if cache_keys_list:
                for k, v in _kwds.items():
                    if k not in cache_keys_list:
                        _kwds.pop(k, None)
            ckey = ""
            if _kwds:
                ckey = _encode_cache_key(_kwds)

            ckey = "{}#{}#{}".format(prefix, ckey, suffix)
            #logging.error(ckey)
            ckey = hashlib.md5(ckey).hexdigest()

            if len(ckey) > 200:
                ckey = ckey[:200]

            try:
                #print 'ckey:', ckey
                #print im_cache.get(ckey)
                value = None if custom_is_update_cache else im_cache.get(ckey)
                #logging.error(value)
                #print value
                if value is None:
                    # TODO: to fix: need save None
                    if custom_is_update_cache:
                        kwargs['is_update_cache'] = 'YES'
                    value = func(*args, **kwargs)
                    #print ckey,value,expire_time
                    # if value:
                    #import logging.error(value)

                    #logging.error(value)
                    im_cache.set(ckey, value, expire_time)

                return value
            except Exception as e:
                if custom_is_update_cache:
                    kwargs['is_update_cache'] = 'YES'
                return func(*args, **kwargs)

        wrapper.original_function = func
        wrapper.func_name = func.func_name
        wrapper.__doc__ = func.__doc__
        return wrapper

    return decorator


LOCAL_CACHES = {}

def function_local_cache(cache_keys="", prefix='api#phone', suffix='fun', expire_time=60 * 60, is_update_cache='', extkws={}):
    u"""
      cache_keys：缓存取那些参数当key,key之间用豆号分割,空就是用函数所有参数
      prefix:前缀，suffix：后缀
      expire_time：缓存时间，defaut time 30'm
      is_update_cache="YES" or '' ，是否马上更新缓存,空到expire_time才更新缓存
      extkws={},追加缓存参数,同名覆盖缓存参数
      is_obd:"YES" or '' ,缓存运营管理
       生成ckey的长度len不超过200
    """
    global LOCAL_CACHES

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            cache_keys_list = []
            custom_is_update_cache = kwargs.get('is_update_cache', '').upper() == 'YES'
            kwargs.pop('is_update_cache', None)
            if cache_keys:
                cache_keys_list = cache_keys.split(',')
                cache_keys_list = [ele.strip() for ele in cache_keys_list]
            arg_names, varargs, varkw, defaults = inspect.getargspec(func)
            #defaults
            _defargs = dict(zip(arg_names[-len(defaults):], defaults)) if defaults else {}
            _args1 = dict(zip(arg_names, args))
            _kwds = dict(_defargs, **_args1)
            _kwds.update(kwargs)
            _kwds.update(extkws)
            otheragrs = []
            if varargs:
                tmp = _args1.values()
                otheragrs = [v for v in args if v not in tmp]
                if otheragrs:
                    for i in xrange(0, len(otheragrs)):
                        _k = "_arg{}".format(i)
                        _kwds[_k] = otheragrs[i]

            if cache_keys_list:
                for k, v in _kwds.items():
                    if k not in cache_keys_list:
                        _kwds.pop(k, None)
            ckey = ""
            if _kwds:
                ckey = _encode_cache_key(_kwds)

            ckey = "{}#{}#{}".format(prefix, ckey, suffix)
            #logging.error(ckey)
            ckey = hashlib.md5(ckey).hexdigest()


            if len(ckey) > 200:
                ckey = ckey[:200]

            #try:
            value = None if custom_is_update_cache else LOCAL_CACHES.get(ckey)

            
            if value is None:
                # TODO: to fix: need save None
                if custom_is_update_cache:
                    kwargs['is_update_cache'] = 'YES'
                value = func(*args, **kwargs)


                #本地内存容量不能大于200，大于后将清空，慎重使用
                if len(LOCAL_CACHES)>=200:
                    delete_keys = []
                    #清楚已经过去的keys
                    for k,v in LOCAL_CACHES.iteritems():
                        _expire_time = v.get("expire_time")
                        if _expire_time<=int(time.time()):
                            delete_keys.append(k)

                    for k in delete_keys:
                        LOCAL_CACHES.pop(k)

                #这里有个阈值，大于300就不能够在往内存放了，防止内存占满
                if len(LOCAL_CACHES) >=300:
                    return None

                d = {
                    "expire_time" : int(time.time()) +  expire_time,
                    "v":value,
                }


                LOCAL_CACHES[ckey] = d

                return value

            else: 
                #处理过期时间
                _expire_time = value.get('expire_time')
                if _expire_time<=int(time.time()):
                    LOCAL_CACHES.pop(ckey)

                return value.get("v")

            # except Exception, e:
            #     if custom_is_update_cache:
            #         kwargs['is_update_cache'] = 'YES'
            #     return func(*args, **kwargs)

        wrapper.original_function = func
        wrapper.func_name = func.func_name
        wrapper.__doc__ = func.__doc__
        return wrapper

    return decorator


