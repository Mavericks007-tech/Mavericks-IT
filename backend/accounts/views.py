"""Session-based JSON auth for custom admin frontend."""
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response


def _user_payload(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': user.get_full_name(),
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'groups': list(user.groups.values_list('name', flat=True)),
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def csrf(request):
    """Issue a CSRF cookie for the SPA to use on POSTs."""
    return Response({'csrfToken': get_token(request)})


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    if not username or not password:
        return Response({'detail': 'Username and password required.'}, status=400)
    user = authenticate(request, username=username, password=password)
    if not user:
        return Response({'detail': 'Invalid credentials.'}, status=401)
    if not user.is_staff:
        return Response({'detail': 'Staff access required.'}, status=403)
    login(request, user)
    return Response(_user_payload(user))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(_user_payload(request.user))
