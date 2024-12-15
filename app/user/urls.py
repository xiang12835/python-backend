from django.urls import path
from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns

from app.user import api_v1, api_v2, api_v3
from app.user.views import system_user
# from django.contrib import admin
#
# admin.autodiscover()


urlpatterns = [

    # 系统用户管理
    # url(r'^system_user/list$', 'app.user.views.system_user.system_user_list', name='system_user_list'),
    # url(r'^system_user/detail$', 'app.user.views.system_user.system_user_new', name='system_user_new'),
    # url(r'^system_user/password$', 'app.user.views.system_user.change_password', name='change_password'),
    path('system_user/list', system_user.system_user_list, name='system_user_list'),
    path('system_user/detail', system_user.system_user_new, name='system_user_new'),
    path('system_user/password', system_user.change_password, name='change_password'),

    # v1: @api_view decorator + json
    path('api/v1/user_lst/', api_v1.user_lst),
    path('api/v1/user_add/', api_v1.user_add),
    path('api/v1/user_upd/<int:pk>/', api_v1.user_upd),
    path('api/v1/user_dtl/<int:pk>/', api_v1.user_dtl),
    path('api/v1/user_del/<int:pk>/', api_v1.user_del),


    # v2: @api_view decorator + serializers
    path('api/v2/users/', api_v2.user_list),
    path('api/v2/users/<int:pk>', api_v2.user_detail),


    # v3: APIView class + serializers
    path('api/v3/users/', api_v3.UserList.as_view()),
    path('api/v3/users/<int:pk>/', api_v3.UserDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
