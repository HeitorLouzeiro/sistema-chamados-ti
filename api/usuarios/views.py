import re

from chamados.filters import UsuarioFilter
from django.contrib.auth import authenticate
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from .models import Usuario
from .serializers import (TecnicoSerializer, UsuarioCreateSerializer,
                          UsuarioListSerializer, UsuarioSerializer)


def is_valid_phone(phone):
    """Valida se o telefone tem exatamente 11 dígitos"""
    if not phone:
        return True  # Telefone é opcional

    # Remove todos os caracteres não numéricos
    digits_only = re.sub(r'\D', '', phone)

    # Verifica se tem exatamente 11 dígitos
    return len(digits_only) == 11


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


@api_view(['GET', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def usuario_perfil(request):
    """Retorna ou atualiza o perfil do usuário logado"""
    if request.method == 'GET':
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        usuario = request.user

        # Validar telefone se fornecido
        telefone = request.data.get('telefone')
        if telefone is not None and not is_valid_phone(telefone):
            return Response(
                {'telefone': [
                    'Telefone deve ter exatamente 11 dígitos (DDD + número)']},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UsuarioSerializer(
            usuario, data=request.data, partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def alterar_senha(request):
    """Altera a senha do usuário logado"""

    senha_atual = request.data.get('senha_atual')
    nova_senha = request.data.get('nova_senha')
    confirmar_senha = request.data.get('confirmar_senha')

    # Validações
    if not senha_atual or not nova_senha or not confirmar_senha:
        return Response(
            {'detail': 'Todos os campos são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if nova_senha != confirmar_senha:
        return Response(
            {'detail': 'Nova senha e confirmação não coincidem'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(nova_senha) < 6:
        return Response(
            {'detail': 'Nova senha deve ter pelo menos 6 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verificar senha atual
    usuario = authenticate(
        username=request.user.username,
        password=senha_atual
    )
    if not usuario:
        return Response(
            {'detail': 'Senha atual incorreta'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Alterar senha
    request.user.set_password(nova_senha)
    request.user.save()

    return Response({'detail': 'Senha alterada com sucesso'})
