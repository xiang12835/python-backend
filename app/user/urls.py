from django.urls import path
from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from app.user.views import user_view
from app.user.views import user_api_v1, user_api_v2, user_api_v3
# from django.contrib import admin
#
# admin.autodiscover()

# 后管 url
urlpatterns = [

    path('system_user/list', user_view.system_user_list, name='system_user_list'),
    path('system_user/detail', user_view.system_user_new, name='system_user_new'),
    path('system_user/password', user_view.change_password, name='change_password'),


]

# 接口 url
urlpatterns += [
    # v1: @api_view decorator + json
    path('api/v1/user_lst/', user_api_v1.user_lst),
    path('api/v1/user_add/', user_api_v1.user_add),
    path('api/v1/user_upd/<int:pk>/', user_api_v1.user_upd),
    path('api/v1/user_dtl/<int:pk>/', user_api_v1.user_dtl),
    path('api/v1/user_del/<int:pk>/', user_api_v1.user_del),


    # v2: @api_view decorator + serializers
    path('api/v2/users/', user_api_v2.user_list),
    path('api/v2/users/<int:pk>', user_api_v2.user_detail),


    # v3: APIView class + serializers
    path('api/v3/users/', user_api_v3.UserList.as_view()),
    path('api/v3/users/<int:pk>/', user_api_v3.UserDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
