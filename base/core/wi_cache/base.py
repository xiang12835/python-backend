﻿# encoding = utf-8

import sys
import collections
import functools
import hashlib
import logging

from django.conf import settings
from django.core.cache import parse_backend_uri
from django.db import models
from django.db.models import signals
from django.db.models.sql import query
from django.utils import encoding, translation
from django.contrib.auth.models import UserManager
from django.db import models
from django.db.models.query import QuerySet, EmptyQuerySet, insert_query, RawQuerySet
from django.utils.encoding import smart_str
from mongoengine.queryset import QuerySetManager
from . import PyPoolMemcache

try:
    import cjson as json

    json.loads = json.decode
    json.dumps = json.encode
except:
    import json


class NullHandler(logging.Handler):
    """
     log handler  this is no use now
     """

    def emit(self, record):
        pass


def cache_key(klass, _id):
    """
         produce the key
         the formation of the key is object:Class:id
         param:
             _id:type is integer
         return:
             key:string
     """
    return smart_str("o:%s:%s" % (klass.__name__, _id))


class CachingManager(models.Manager):
    """
     Caching Manager,for manager objects.get or .filter(*args,**kwargs)
     class Zomg( models.Model):
         val = models.IntegerField()
         objects = caching.base.UserCachingManager()
     """

    def get_query_set(self):
        return CachingQuerySet(self.model, using=self._db)

    def contribute_to_class(self, cls, name):
        """
          overwrite Base，added Save，Delete Callback
          """
        signals.post_save.connect(self.post_save, sender=cls)
        signals.post_delete.connect(self.post_delete, sender=cls)
        return super(CachingManager, self).contribute_to_class(cls, name)

    def post_save(self, instance, **kwargs):
        """
          invalidate the object that already saved
          param:
              instance:the instance of Object
          """
        self.invalidate(instance)

    def post_delete(self, instance, **kwargs):
        """
          invalidate the object that already deleted
          param:
              instance:the instance of Object
          """
        self.invalidate(instance)

    def invalidate(self, instance):
        """
          update the instance of Object
          """
        key = cache_key(instance.__class__, instance.pk)
        try:
            PyPoolMemcache.delete(key)
        except Exception, e:
            logging.error(e)


    def get(self, *args, **kwargs):
        """ overwrite the get of django
              only cache id == ?
          """
        _id = None
        if len(kwargs) == 1 and len(args) == 0:
            _id = kwargs.get("id") or kwargs.get("pk")
            if _id:
                key = cache_key(self.model, _id)
                try:
                    m = PyPoolMemcache.get(key)
                    if m:
                        logging.debug("get %s from cache" % key)
                        return m
                except Exception, e:
                    print e

        model = super(CachingManager, self).get(*args, **kwargs)
        if _id:
            try:
                if model:
                    timeout = kwargs.get("_timeout_", 60 * 60)  #1hour
                    PyPoolMemcache.set(key, model, timeout)
            except Exception, e:
                logging.error(e)

        return model


class CachingQuerySet(models.query.QuerySet):
    def __init__(self, *args, **kw):
        super(CachingQuerySet, self).__init__(*args, **kw)

    def flush(self):
        """
        Run two queries to get objects: one for the ids, one for id__in=ids.

        After getting ids from the first query we can try cache.get_many to
        reuse objects we've already seen.  Then we fetch the remaining items
        from the db, and put those in the cache.  This prevents cache
        duplication.
        """
        # Include columns from extra since they could be used in the query's
        # order_by.
        vals = self.values_list('pk', * self.query.extra.keys()) or []
        pks = [val[0] for val in vals]

        for obj in self.all():
            key = cache_key(obj.__class__, obj.pk)
            #print "update"," * " * 20
            #print key
            try:
                PyPoolMemcache.delete(key)
            except Exception, e:
                logging.error(e)
        return pks

    def update(self, **kwargs):
        """
        Updates all elements in the current QuerySet, setting all the given
        fields to the appropriate values.
        """

        rows = super(CachingQuerySet,self).update(**kwargs)
        #flush queryset update
        self.flush()
        return rows
    update.alters_data = True
