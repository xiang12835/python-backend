# -*- coding:utf-8 -*-
import base64
import hashlib
import hmac
import json
import random
import re
import string
import time
import uuid
from datetime import datetime
from hashlib import sha1
import os
from django.core.exceptions import ObjectDoesNotExist
# import shutil
# from poster.encode import MultipartParam, multipart_encode

import qrcode
import requests
import urllib

def force_to_str(_id):
    return "%s" % _id


def _decode_video_id(vid):
    if isinstance(vid, (int, )) or str(vid).isdigit():
        return int(vid)
    try:
        return int(base64.b64decode(vid[1:])) >> 2
    except:
        return 0


def decode_video_id(vid, to_str=False):
    """
    Python 3中的 int 类型就是Python 2中 int 和 long 类型的合并，它能够表示任意大小的整数。
    """
    decoded_vid = _decode_video_id(vid)
    return force_to_str(decoded_vid) if to_str else decoded_vid


def _decode_user_id(uid):
    """
    Python 2的 unicode 类型在Python 3中对应的是 str 类型。
    当你从Python 2迁移到Python 3时，通常需要将Python 2中的 unicode 字符串直接视为Python 3中的 str 字符串，
    而Python 2中的 str 字节串则需要根据需要进行解码（使用 .decode() 方法）以转换为Python 3的 str 字符串，或者保持为 bytes 类型以进行二进制数据处理。
    """
    if isinstance(uid, str):
        uid = uid.encode('utf-8')
    if isinstance(uid, (int, )) or str(uid).isdigit():
        return int(uid)
    try:
        return int(base64.b64decode(uid[1:])) >> 2
    except:
        return 0


def encode_utf8(val):
    if isinstance(val, str):
        return val.encode("utf8")
    return val


def decode_user_id(uid, to_str=False):
    decoded_uid = _decode_user_id(uid)
    return force_to_str(decoded_uid) if to_str else decoded_uid

def get_paged_dict(item_list, page_pos=1, one_page_count=20, item_name='items'):
    from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
    p = Paginator(item_list, one_page_count)
    display_pages = []
    try:
        items = p.page(page_pos)
        now_page = int(page_pos)
    except (PageNotAnInteger, EmptyPage, ValueError):
        items = p.page(1)
        now_page = 1
    if p.num_pages <= 5:
        display_pages = map(str, range(1, p.num_pages+1))
    else:
        if now_page - 4 > 1:
            display_pages += ['1', '...', ] + map(str, range(now_page-2, now_page+1))
        else:
            display_pages += map(str, range(1, now_page+1))
        if now_page + 4 < p.num_pages:
            display_pages += map(str, range(now_page+1, now_page+3)) + ['...', str(p.num_pages)]
        else:
            display_pages += map(str, range(now_page+1, p.num_pages+1))
    page_info_dict = {item_name: items, 'page_range': p.page_range, 'num_pages': str(p.num_pages),
                      'now_page': str(now_page), 'display_pages': display_pages, 'previous_page': now_page-1,
                      'next_page': now_page+1,'num_count': p.count}
    return page_info_dict

# Encryption
class Encryption(object):
    """加密工具类"""

    def __init__(self, to_encode, encode_type='md5', key=''):
        self.encode_type = encode_type

        # uniform type of to_encode
        self.to_encode = str(to_encode)
        self.encode_key = key

    def encode(self):
        if self.encode_type == "hmac_sha1":
            return hmac_sha1_encode(self.to_encode, self.encode_key)
        else:
            _crypt = hashlib.new(self.encode_type)
            _crypt.update(self.to_encode)
            return _crypt.hexdigest()


# HttpRequest get and post
class CustomRequest(object):
    """Http请求类"""

    def __init__(self, method, url, request=None, headers=None, cookies=None,
                 params=None, files=None):
        """
        :param method: 请求方法目前只支持get、post
        :param url: 请求url
        :param headers: 头部
        :param cookies: cookies
        :param params: get：请求参数；post：请求数据
        :param files: post请求时支持上传文件例：files = {'file': open('report.xls', 'rb')}
        """
        self.method = method
        self.url = url
        self.headers = headers or {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Encoding': 'gzip, deflate, sdch',
            'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
            'Cache-Control': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko)'
                          'Chrome/53.0.2785.143 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        self.params = params
        self.cookies = cookies
        self.files = files
        self.request = request

    def do_request(self):
        r = requests.Response()
        if self.method.lower() == "get":
            r = requests.get(self.url, params=self.params, headers=self.headers,
                             cookies=self.cookies, verify=False)
            return r.content
        elif self.method.lower() == "post":
            r = requests.post(url=self.url, data=self.params,
                              headers=self.headers, cookies=self.cookies,
                              files=self.files, verify=False)
            return r.json()


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, datetime):
        serial = obj.isoformat()
        return serial
    raise TypeError("Type not serializable")


def json_encode(value):
    return json.dumps(value, default=json_serial)


def gen_qrcode(data):
    """生成二维码"""
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image()
    return img


def gen_random_string(n=32):
    assert n > 0
    choiceString = string.ascii_lowercase + string.digits

    if n <= 36:
        return "".join(random.sample(choiceString, n))

    # TODO: 待优化
    aList = []
    for i in range(n):
        aList.append(choiceString[random.randint(0, len(choiceString) - 1)])
    return "".join(aList)


def gen_uuid():
    return str(uuid.uuid1()).replace("-", "")


def gen_verify_code():
    return "".join(random.sample(string.digits, 4))


def get_primary_key():
    """
    获取主键：
    之前的做法是用时间字符串+sequence拼成，sequence从数据库中取,
    由于数据库类型已定，只能将错就错
    """
    # timestr = datetime.now().strftime("%Y%m%d%H%M%S%f") + "".join(
    #     random.sample(string.digits, 4))

    ss = "%04d" % random.randint(0,9999)
    timestr = datetime.now().strftime("%Y%m%d%H%M%S%f") + ss
    return timestr


def gen_id():
    return int(time.time() * 10 ** 6)


def remove_duplicate(dict_list):
    """字典列表去重"""
    # seen = set()
    # new_dict_list = []
    # for dt in dict_list:
    #     seen.add(tuple(dt.items()))
    # for item in seen:
    #     new_dict_list.append(dict(item))
    # return new_dict_list
    new_list = []
    for item in dict_list:
        if item not in new_list:
            new_list.append(item)
    return new_list


def hmac_sha1_encode(raw, key=""):
    hashed = hmac.new(key, raw, sha1)
    return hashed.digest().encode("base64").rstrip('\n')


def replace_image_url(mat):
    if mat:
        return 'src="%s"' % (
            "http://182.xxx.209.199:18" + mat.group(1))


def replace_image_url(mat):
    if mat:
        return 'src="%s"' % (
            "http://img.xxx.com" + "/" + mat.group(1))


def render_html_img(value, type):
    if int(type) == 1:
        request_path = "http://182.xx.209.199"
        replace_func = replace_image_url
    else:
        request_path = "http://img.xxx.com"
        replace_func = replace_image_url

    if request_path not in value:
        return re.sub(r'src=\s*?[\"\'](.*?)[\"\']', replace_func, value)
    return value


def remove_a_tag(value):
    return re.sub(r'</?a.*?>', '', value)


def redefine_item_pos(model, sorted_key, item_ids):
    """
    make the item save the new position after change position
    :param model:
    :param item_ids:
    :return:
    """
    try:
        item_ids = item_ids.split(',')
        items = []
        # primary_key = "%s__in" % sorted_key
        # model.objects.filter(primary_key=item_ids)

        for item_id in item_ids:
            item = model.objects.get(**{sorted_key: item_id})
            items.append(item)
        position_shuffle(items, saved=True)
    except ValueError:
        return
    except ObjectDoesNotExist as e:
        # logger.exception(e)
        print(e)


def position_shuffle(objs, saved=False):
    """
    :param list objs: objects need to be ordered
    :param bool saved: True / False
    code sample::
        position_shuffle( HomeBox.objects.all(), True)
    """
    if objs:
        for index, obj in enumerate(objs):
            if obj.position != index:
                obj.position = index
                if saved:
                    obj.save()
        return objs
    else:
        return []


def upload_file(memfile, url="http://123.xxx.180.82/file/upload/", data=None, _headers=None):
    if not _headers:
        _headers = {"Content-Type": "multipart/form-data"}

    tmp_path = './tmp_%s' % urllib.quote(memfile.name)
    #print " * " * 20
    #print tmp_path

    save_tmp_file(memfile, tmp_path)
    files = {"files": open(tmp_path, 'rb')}

    r = requests.post(url, files=files)
    r_json = r.json()
    remote_path = r_json.get("result", {}).get("filePath", None)
    if remote_path:
        os.remove(tmp_path)

    return remote_path


def save_tmp_file(f, path):
    with open(path, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)


def write_to_csv(results, filename="tmp.csv"):
    import csv
    import codecs
    fieldnames = results[0].keys()
    with codecs.open(filename, 'wb', 'utf_8_sig') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)


def get_primary_key():
    """
    获取主键：
    之前的做法是用时间字符串+sequence拼成，sequence从数据库中取,
    由于数据库类型已定，只能将错就错
    """
    now = datetime.now()
    timestr = datetime.now().strftime("%Y%m%d%H%M%S%f") + \
              "".join(random.sample(string.digits, 4))
    return timestr


def strip_p_label(value):
    value = value.strip()
    if value.startswith("<p>"):
        value = value[3:]
    if value.endswith("</p>"):
        value = value[:-4]
    value = value.strip()
    return value

def strip_span_label(value):
    value = value.strip()
    value = value.replace('XXX教研','YYY教研')
    if value.count('<span class="desClass">') > 1 or value.count('</span>') > 1:
        value = value.replace('<span class="desClass">', '')
        value = value.replace('</span>', '')
    return value


def add_span_label(value):
    value = value.strip()
    if value.startswith('<span class="desClass">') and value.endswith('</span>'):
        return value

    return '<span class="desClass">' + value + '</span>'


if __name__ == "__main__":
    print(strip_p_label("<p>123<p>567</p>890</p>"))
    print(Encryption(u"xxx").encode())
    print(gen_random_string(100))
    print(gen_uuid())
    # print gen_verify_code()
    # print sorted(remove_duplicate([{"a": 1, "b": 2}, {"a": 1, "b": 2}, {"a": 3, "b": 5}]), key=lambda x: (x["a"], x["b"]))
    print(get_primary_key())
    print(gen_id())
    # print(hmac_sha1_encode(
    #     "GETcvm.api.qcloud.com/v2/index.php?Action=DescribeInstances&Nonce=11886&Region=gz&SecretId=AKIDz8krbsJ5yKBZQpnxxWFkmLPx3gnPhESA&Timestamp=1465185768&instanceIds.0=ins-09dx96dg&limit=20&offset=0",
    #     "Gu5t9xGARNpqxxcd98joQYCN3Cozk1qA"))
