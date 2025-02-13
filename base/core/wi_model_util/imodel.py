#encoding = utf-8
# import StringIO
import threading, time
import datetime
import os, sys

from django.db.models.manager import Manager
from django.db.models.query import QuerySet


def _get_queryset(klass):
	"""
Returns a QuerySet from a Model, Manager, or QuerySet. Created to make
get_object_or_404 and get_list_or_404 more DRY.
"""
	if isinstance(klass, QuerySet):
		return klass
	elif isinstance(klass, Manager):
		manager = klass
	else:
		manager = klass._default_manager
	return manager.all()


def get_object_or_none(klass, *args, **kwargs):
	"""
Uses get() to return an object, or return None if the object
does not exist.

klass may be a Model, Manager, or QuerySet object. All other passed
arguments and keyword arguments are used in the get() query.

Note: Like with get(), an MultipleObjectsReturned will be raised if more than one
object is found.
return:
	query set
"""
	queryset = _get_queryset(klass)
	try:
		return queryset.get(*args, **kwargs)
	except queryset.model.DoesNotExist:
		return None


def queryset_to_dict(qs, key='pk'):
	"""
	Given a queryset will transform it into a dictionary based on ``key``.
	param:
		key: string  default is 'pk'
	"""
	return dict((getattr(u, key), u) for u in qs)


def distinct(l):
	"""
	Given an iterable will return a list of all distinct values.
	param:
		l:an iterable
	return:
		list
	"""
	return list(set(l))


def attach_foreignkey(objects, field, qs=None):
	"""
	Shortcut method which handles a pythonic LEFT OUTER JOIN.
	``attach_foreignkey(posts, Post.thread)``
	param:
		objects: object
		fields: the field and point to other object
		qs:default is None  list of object
	"""
	field = field.field
	if qs is None:
		qs = field.rel.to.objects.all()
	qs = qs.filter(pk__in=distinct(getattr(o, field.column) for o in objects))
	#if select_related:
	#    qs = qs.select_related(*select_related)
	queryset = queryset_to_dict(qs)
	for o in objects:
		setattr(o, '_%s_cache' % (field.name), queryset.get(getattr(o, field.column)))


def attach_raw_foreignkey(objects, field, qs):
	"""
	Shortcut method which handles a pythonic LEFT OUTER JOIN.
	``attach_raw_foreignkey(posts, thread, Thread.objects)``
	param:
		objects: object
		fields: the field and point to other object
		qs:default is None  list of object
	"""
	qs = qs.filter(pk__in=distinct(getattr(o, field) for o in objects))
	#if select_related:
	#    qs = qs.select_related(*select_related)
	queryset = queryset_to_dict(qs)
	for o in objects:
		setattr(o, '%s' % (field), queryset.get(getattr(o, field.column)))


def attach_database_raw_foreignkey(objects, bind_field, field_id, qs, key=''):

	if key:

		_dict = {
			key + "__in": distinct(getattr(o, field_id) for o in objects if getattr(o, field_id))

		}

		qs = qs.filter(**_dict)

		queryset = queryset_to_dict(qs, key=key)

	else:

		qs = qs.filter(pk__in=distinct(getattr(o, field_id) for o in objects if getattr(o, field_id)))

		queryset = queryset_to_dict(qs)

	for o in objects:
		setattr(o, '%s' % (bind_field), queryset.get(getattr(o, field_id)))

