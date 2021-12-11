from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from user import views
from user import api


urlpatterns = [

    path('api/v1/user_lst/', api.user_lst),
    path('api/v1/user_add/', api.user_add),
    path('api/v1/user_upd/<int:pk>/', api.user_upd),
    path('api/v1/user_dtl/<int:pk>/', api.user_dtl),
    path('api/v1/user_del/<int:pk>/', api.user_del),

    path('api/v2/users/', views.UserList.as_view()),
    path('api/v2/users/<int:pk>/', views.UserDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
