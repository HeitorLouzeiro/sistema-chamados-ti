from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import UsuarioSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Endpoint para login"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username e password são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        if user.ativo:
            login(request, user)
            serializer = UsuarioSerializer(user)
            return Response({
                'user': serializer.data,
                'message': 'Login realizado com sucesso'
            })
        else:
            return Response(
                {'error': 'Usuário inativo'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    else:
        return Response(
            {'error': 'Credenciais inválidas'},
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['POST'])
def logout_view(request):
    """Endpoint para logout"""
    logout(request)
    return Response({'message': 'Logout realizado com sucesso'})
