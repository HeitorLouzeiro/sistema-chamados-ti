from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Usuario
from .serializers import (
    UsuarioSerializer, UsuarioCreateSerializer, 
    UsuarioListSerializer, TecnicoSerializer
)
from chamados.filters import UsuarioFilter


class UsuarioListCreateView(generics.ListCreateAPIView):
    """View para listar e criar usuários"""
    
    queryset = Usuario.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = UsuarioFilter
    search_fields = ['nome_completo', 'username', 'email', 'departamento']
    ordering_fields = ['nome_completo', 'date_joined']
    ordering = ['-date_joined']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UsuarioCreateSerializer
        return UsuarioListSerializer


class UsuarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View para detalhar, atualizar e deletar usuário"""
    
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]


class TecnicoListView(generics.ListAPIView):
    """View para listar apenas técnicos"""
    
    queryset = Usuario.objects.filter(tipo_usuario='tecnico', ativo=True)
    serializer_class = TecnicoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nome_completo', 'email']
    ordering = ['nome_completo']


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def usuario_perfil(request):
    """Retorna o perfil do usuário logado"""
    serializer = UsuarioSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def atualizar_perfil(request):
    """Atualiza o perfil do usuário logado"""
    usuario = request.user
    serializer = UsuarioSerializer(usuario, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
