from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UsuarioSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Endpoint para login com JWT"""
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
            # Gerar tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            serializer = UsuarioSerializer(user)
            return Response({
                'access': str(access_token),
                'refresh': str(refresh),
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
@permission_classes([AllowAny])
def logout_view(request):
    """Endpoint para logout - JWT stateless sem blacklist"""
    return Response({
        'message': 'Logout realizado com sucesso'
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """Endpoint para renovar token de acesso"""
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token é obrigatório'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token = RefreshToken(refresh_token)
        access_token = token.access_token
        
        return Response({
            'access': str(access_token),
            'message': 'Token renovado com sucesso'
        })
    except Exception as e:
        return Response(
            {'error': 'Token inválido ou expirado'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
