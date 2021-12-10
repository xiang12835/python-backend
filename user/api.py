# coding=utf-8
from rest_framework import serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from user.models import User


# https://www.django-rest-framework.org/tutorial/2-requests-and-responses/
@api_view(['GET'])
def user_lst(request):
    """
    List all user.
    """
    datas = [user.to_json() for user in User.objects.all()]
    return Response(datas)


@api_view(['POST'])
def user_add(request):
    """
    create a user instance.
    """
    try:
        qd = request.data
        user = User()
        user.name = qd.get("name")
        user.age = qd.get("age")
        user.save()
        return Response(user.to_json(), status=status.HTTP_201_CREATED)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def user_dtl(request, pk):
    """
    Retrieve a user instance.
    """
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    return Response(user.to_json())


@api_view(['PUT'])
def user_upd(request):
    """
    update a user instance.
    """
    qd = request.data

    try:
        user = User.objects.get(pk=qd.get("id"))
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    try:
        user.name = qd.get("name")
        user.age = qd.get("age")
        user.save()
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    return Response(user.to_json())


@api_view(['DELETE'])
def user_del(request, pk):
    """
    delete a user instance.
    """
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    try:
        user.delete()
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    return Response(status=status.HTTP_204_NO_CONTENT)

