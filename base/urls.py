"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.views import logout_then_login, LoginView
from base import views
from rest_framework import routers, serializers, viewsets


from rest_framework.schemas import get_schema_view
from rest_framework_swagger.renderers import SwaggerUIRenderer, OpenAPIRenderer
schema_view = get_schema_view(title='加邮 API', renderer_classes=[OpenAPIRenderer, SwaggerUIRenderer])



# # Serializers define the API representation.
# class UserSerializer(serializers.HyperlinkedModelSerializer):
#     class Meta:
#         model = User
#         fields = '__all__'
#
#
# # ViewSets define the view behavior.
# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#
#
# # Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
# router.register(r'users', UserViewSet)


urlpatterns = [
    # 首页
    path("", views.index),
    path('signin/', LoginView.as_view(template_name='signin.html'), name="signin"),
    path('signout/', logout_then_login, name="signout"),

    # 后台管理系统 url
    path('admin/', admin.site.urls),

    # https://www.django-rest-framework.org/
    # django rest api & api auth (login/logout)
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),

    # https://django-rest-swagger.readthedocs.io/en/latest/
    # swagger ui
    path('doc/', schema_view, name='doc'),

    # system_user
    path('system_user/list', views.system_user_list, name='system_user_list'),
    path('system_user/detail', views.system_user_new, name='system_user_new'),
    path('system_user/password', views.change_password, name='change_password'),

    # custom app
    path('user/', include('app.user.urls')),
    # path('stat/', include('app.stat.urls')),

]
