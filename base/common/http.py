# coding=utf-8
from rest_framework.response import Response


class R(Response):
    def __init__(self, results=None, status=0, msg='ok', http_status=None,
                 headers=None, exception=False, content_type=None, **kwargs):
        # 将status、msg、results、kwargs格式化成data
        data = {
            'status': status,
            'msg': msg,
        }
        # results只要不为空都是数据：False、0、'' 都是数据 => 条件不能写if results
        if results is not None:
            data['result'] = results
        # 将kwargs中额外的k-v数据添加到data中
        data.update(**kwargs)

        super().__init__(data=data, status=http_status, headers=headers, exception=exception, content_type=content_type)

