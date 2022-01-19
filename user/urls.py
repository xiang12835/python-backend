from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from user import views
from user import api_v1, api_v2, api_v3


urlpatterns = [

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

# urlpatterns = format_suffix_patterns(urlpatterns)
