# coding=utf-8
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from user.models import User


class UserList(APIView):
    """
    View to list all users in the system.

    * Requires token authentication.
    * Only admin users are able to access this view.
    """
    # authentication_classes = [authentication.TokenAuthentication]
    # permission_classes = [permissions.IsAdminUser]

    def get(self, request, format=None):
        """
        Return a list of all users.
        """
        datas = [user.to_json() for user in User.objects.all()]
        return Response(datas)


class UserDetail(APIView):
    # 单查群查
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        if pk:
            user_obj = User.objects.get(pk=pk)
            # user_ser = serializers.UserModelSerializer(user_obj)
        else:
            user_query = User.objects.filter().all()
            # user_ser = serializers.UserModelSerializer(user_query, many=True)
        # return APIResponse(results=book_ser.data)
        return Response(data=user_obj.to_json())
