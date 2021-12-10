from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from user import views
from user import api


urlpatterns = [
    path('api/users/', views.UserList.as_view()),
    path('api/users/<int:pk>/', views.UserDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
