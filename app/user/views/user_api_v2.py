from rest_framework import status
from rest_framework.decorators import api_view
from base.libs.net.http import R
from app.user.models.user_model import SystemUser as User
from app.user.serializers import UserSerializer


# https://www.django-rest-framework.org/tutorial/2-requests-and-responses/
@api_view(['GET', 'POST'])
def user_list(request):
    """
    List all code users, or create a new user.
    """
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return R(serializer.data)

    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return R(serializer.data, status=status.HTTP_201_CREATED)
        return R(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, pk):
    """
    Retrieve, update or delete a code user.
    """
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return R(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return R(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return R(serializer.data)
        return R(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user.delete()
        return R(status=status.HTTP_204_NO_CONTENT)
