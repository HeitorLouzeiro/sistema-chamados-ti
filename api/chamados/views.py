from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import TipoServico, Chamado, AnexoChamado, HistoricoChamado
from .serializers import (
    TipoServicoSerializer, ChamadoListSerializer, ChamadoDetailSerializer,
    ChamadoCreateSerializer, ChamadoUpdateSerializer, ChamadoStatusUpdateSerializer,
    AnexoChamadoSerializer, AnexoChamadoUploadSerializer, HistoricoChamadoSerializer
)
from .filters import ChamadoFilter

from django.db import models


class TipoServicoListView(generics.ListAPIView):
    """View para listar tipos de serviço"""
    
    queryset = TipoServico.objects.filter(ativo=True)
    serializer_class = TipoServicoSerializer
    permission_classes = [permissions.IsAuthenticated]  # Permitir acesso sem autenticação
    pagination_class = None  # Desabilitar paginação para tipos de serviço
    ordering = ['nome']


class ChamadoListCreateView(generics.ListCreateAPIView):
    """View para listar e criar chamados"""
    
    queryset = Chamado.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ChamadoFilter
    search_fields = ['numero', 'titulo', 'descricao', 'equipamento', 'localizacao']
    ordering_fields = ['criado_em', 'atualizado_em', 'prioridade']
    ordering = ['-criado_em']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChamadoCreateSerializer
        return ChamadoListSerializer
    
    def perform_create(self, serializer):
        chamado = serializer.save(solicitante=self.request.user)
        
        # Criar histórico
        HistoricoChamado.objects.create(
            chamado=chamado,
            tipo_acao='criado',
            descricao=f'Chamado criado por {self.request.user.nome_completo}',
            usuario=self.request.user
        )


class ChamadoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View para detalhar, atualizar e deletar chamado"""
    
    queryset = Chamado.objects.all()
    serializer_class = ChamadoDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ChamadoUpdateSerializer
        return ChamadoDetailSerializer
    
    def perform_update(self, serializer):
        chamado_anterior = self.get_object()
        chamado = serializer.save()
        
        # Verificar mudanças e criar histórico
        if chamado_anterior.status != chamado.status:
            HistoricoChamado.objects.create(
                chamado=chamado,
                tipo_acao='status_alterado',
                descricao=f'Status alterado de "{chamado_anterior.get_status_display()}" para "{chamado.get_status_display()}"',
                usuario=self.request.user
            )
        
        if chamado_anterior.tecnico_responsavel != chamado.tecnico_responsavel:
            if chamado.tecnico_responsavel:
                HistoricoChamado.objects.create(
                    chamado=chamado,
                    tipo_acao='tecnico_atribuido',
                    descricao=f'Técnico {chamado.tecnico_responsavel.nome_completo} atribuído ao chamado',
                    usuario=self.request.user
                )
            else:
                HistoricoChamado.objects.create(
                    chamado=chamado,
                    tipo_acao='tecnico_removido',
                    descricao=f'Técnico removido do chamado',
                    usuario=self.request.user
                )


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def atualizar_status_chamado(request, pk):
    """Atualiza apenas o status do chamado"""
    try:
        chamado = Chamado.objects.get(pk=pk)
    except Chamado.DoesNotExist:
        return Response(
            {'error': 'Chamado não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    status_anterior = chamado.status
    serializer = ChamadoStatusUpdateSerializer(chamado, data=request.data, partial=True)
    
    if serializer.is_valid():
        chamado = serializer.save()
        
        # Criar histórico da mudança de status
        if status_anterior != chamado.status:
            HistoricoChamado.objects.create(
                chamado=chamado,
                tipo_acao='status_alterado',
                descricao=f'Status alterado de "{dict(Chamado.STATUS_CHOICES)[status_anterior]}" para "{chamado.get_status_display()}"',
                usuario=request.user
            )
        
        return Response(ChamadoDetailSerializer(chamado).data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def meus_chamados(request):
    """Retorna os chamados do usuário logado"""
    chamados = Chamado.objects.filter(solicitante=request.user)
    
    # Aplicar filtros se fornecidos
    status_filter = request.GET.get('status')
    if status_filter:
        chamados = chamados.filter(status=status_filter)
    
    serializer = ChamadoListSerializer(chamados, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def chamados_tecnico(request):
    """Retorna os chamados atribuídos ao técnico logado"""
    if request.user.tipo_usuario != 'tecnico':
        return Response(
            {'error': 'Apenas técnicos podem acessar esta funcionalidade'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    chamados = Chamado.objects.filter(tecnico_responsavel=request.user)
    
    # Aplicar filtros se fornecidos
    status_filter = request.GET.get('status')
    if status_filter:
        chamados = chamados.filter(status=status_filter)
    
    serializer = ChamadoListSerializer(chamados, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_anexo(request, chamado_id):
    """Upload de anexo para um chamado"""
    try:
        chamado = Chamado.objects.get(pk=chamado_id)
    except Chamado.DoesNotExist:
        return Response(
            {'error': 'Chamado não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = AnexoChamadoUploadSerializer(data=request.data)
    
    if serializer.is_valid():
        anexo = serializer.save(
            chamado=chamado,
            enviado_por=request.user
        )
        
        # Criar histórico
        HistoricoChamado.objects.create(
            chamado=chamado,
            tipo_acao='anexo_adicionado',
            descricao=f'Anexo "{anexo.nome_original}" adicionado',
            usuario=request.user
        )
        
        return Response(
            AnexoChamadoSerializer(anexo).data,
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def deletar_anexo(request, anexo_id):
    """Deleta um anexo"""
    try:
        anexo = AnexoChamado.objects.get(pk=anexo_id)
    except AnexoChamado.DoesNotExist:
        return Response(
            {'error': 'Anexo não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Verificar permissão
    if (anexo.enviado_por != request.user and 
        request.user.tipo_usuario not in ['admin', 'tecnico']):
        return Response(
            {'error': 'Sem permissão para deletar este anexo'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Criar histórico antes de deletar
    HistoricoChamado.objects.create(
        chamado=anexo.chamado,
        tipo_acao='anexo_removido',
        descricao=f'Anexo "{anexo.nome_original}" removido',
        usuario=request.user
    )
    
    anexo.delete()
    
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def estatisticas_dashboard(request):
    """Retorna estatísticas para o dashboard"""
    
    # Estatísticas gerais
    total_chamados = Chamado.objects.count()
    chamados_abertos = Chamado.objects.filter(status='aberto').count()
    chamados_em_atendimento = Chamado.objects.filter(status='em_atendimento').count()
    chamados_encerrados = Chamado.objects.filter(status='encerrado').count()
    
    # Estatísticas por prioridade
    chamados_urgentes = Chamado.objects.filter(
        prioridade='urgente',
        status__in=['aberto', 'em_atendimento']
    ).count()
    
    # Estatísticas do usuário
    if request.user.tipo_usuario == 'tecnico':
        # Para técnicos, contar chamados abertos OU atribuídos a eles
        
        meus_chamados_queryset = Chamado.objects.filter(
            models.Q(status='aberto') | models.Q(tecnico_responsavel=request.user)
        )
        meus_chamados_count = meus_chamados_queryset.count()
        meus_chamados_pendentes = meus_chamados_queryset.filter(
            status__in=['aberto', 'em_atendimento']
        ).count()
    else:
        meus_chamados_count = Chamado.objects.filter(
            solicitante=request.user
        ).count()
        meus_chamados_pendentes = Chamado.objects.filter(
            solicitante=request.user,
            status__in=['aberto', 'em_atendimento']
        ).count()
    
    return Response({
        'total_chamados': total_chamados,
        'chamados_abertos': chamados_abertos,
        'chamados_em_atendimento': chamados_em_atendimento,
        'chamados_encerrados': chamados_encerrados,
        'chamados_urgentes': chamados_urgentes,
        'meus_chamados': meus_chamados_count,
        'meus_chamados_pendentes': meus_chamados_pendentes,
    })
