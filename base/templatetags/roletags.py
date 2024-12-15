#coding=utf-8
import re
import hashlib
import functools
import sys,os
import datetime
from django.shortcuts import render

from django import template
import datetime
register = template.Library()

@register.simple_tag(takes_context=True)
def check_role_admin(context):
    request = context['request']
    if request.user.role == 5:
        True
    else:
        True


@register.simple_tag(takes_context=True)
def check_role_manager(context):
    request = context['request']
    if request.user.role == 4:
        True
    else:
        False


