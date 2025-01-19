# coding=utf-8
"""
Requirement:
{%load util_tags%}

System build in https://docs.djangoproject.com/en/dev/ref/templates/builtins/
"""
import datetime
import time
from decimal import Decimal
from django import template
import re
from django.conf import settings

register = template.Library()


# 针对state
@register.filter
def dict_get(dict, key):
    """How to Use

    {{ dict|dict_get:key }}

    """

    return dict.get(key, '')

@register.filter()
def format_order(v):
    if v == "0":
        return "下单"
    elif v=="1":
        return "跳转支付"
    elif v=="2":
        return "支付成功"
    else:
        return "其他"



@register.filter
def yes_or_no(value):
    
    if value:
        return "是"
    else:
        return "否"

@register.filter
def to_query_key_string(dic):
    if dic:
        content = '&'.join(['='.join((k,v)) for k,v in dic.iteritems()])
        return  content
    return ""



@register.filter(is_safe=True)
def truncate_zh(str, len):
    return str[:len] + '...'


@register.filter
def index_url(value, str):
    if str in value:
        return True
    else:
        return False


@register.filter
def lower(value):  # Only one argument.
    """Converts a string into all lowercase
        How to Use
        {{ value|lower|lower|.... }}
    """
    return value.lower()


@register.filter
def upper(value):  # Only one argument.
    """Converts a string into all lowercase
        How to Use
        {{ value|lower|lower|.... }}
    """
    return value.upper()


@register.filter
def to_int(value):  # Only one argument.
    if value and len(value) > 0:
        result = int(value)
    else:
        result = 0
    return result


@register.filter
def to_str(value):
    return str(value)


@register.filter
def type_of(value):  # Only one argument.
    return type(value)


# @register.assignment_tag
def get_current_time(format_string):
    """
    How to Use
    You may then store the result in a template variable using the as argument followed by the variable name, and output it yourself where you see fit:
    {% get_current_time "%Y-%m-%d %I:%M %p" as the_time %}
    <p>The time is {{ the_time }}.</p>
    """
    return datetime.datetime.now().strftime(format_string)


@register.filter
def format_timestamp(timestamp):
    """format a timestamp(int)
        How to Use
        {{ value|format_timestamp }}
    """
    return time.strftime("%Y-%m-%d %H:%M", time.localtime(timestamp))


@register.simple_tag()
def fen_to_yuan(value):
    return "%.2f" % round(value / Decimal(100.0), 2)


@register.filter()
def format_float(num, point=3):
    return ("%." + str(point) + "f") % num


@register.filter()
def ifin_list(value, alist):
    assert isinstance(alist, list)
    if value in alist:
        return True

    return False

# HOST = settings.GKAO_API_HOST

SUBJECT_TK = "http://115.xxx.122.45"

# HOST = "http://img.xxx.com"


def replace_image_url(mat):
    if mat:
        return 'src="%s"' % ("http://img.xxx.com" + "/" + mat.group(1))


@register.filter
def render_html_img(value):
    return re.sub(r'src=[\"\'](.*?)[\"\']', replace_image_url, value)


def replace_subject_image_url(mat):
    if mat:
        return 'src="%s"' % (SUBJECT_TK + "/" + mat.group(1))


@register.filter
def render_subject_img(value):
    return re.sub(r'src=[\"\'](.*?)[\"\']', replace_subject_image_url, value)


@register.filter
def order_status_ch(value):
    status_dict = {
        0: "订单创建",
        1: "订单下单",
        2: "订单成功"
    }
    return status_dict.get(int(value), "未知")
