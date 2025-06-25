import django_filters
from django.db import models
from .models import Chamado
from usuarios.models import Usuario


class ChamadoFilter(django_filters.FilterSet):
    """Filtros customizados para chamados"""
    
    # Filtros por data
    criado_apos = django_filters.DateFilter(field_name='criado_em', lookup_expr='gte')
    criado_antes = django_filters.DateFilter(field_name='criado_em', lookup_expr='lte')
    
    # Filtros por período (últimos X dias)
    ultimos_dias = django_filters.NumberFilter(method='filter_ultimos_dias')
    
    # Filtro por múltiplos status
    status_list = django_filters.MultipleChoiceFilter(
        field_name='status',
        choices=Chamado.STATUS_CHOICES
    )
    
    # Filtro por múltiplas prioridades
    prioridade_list = django_filters.MultipleChoiceFilter(
        field_name='prioridade',
        choices=Chamado.PRIORIDADE_CHOICES
    )
    
    # Filtro por texto em múltiplos campos
    busca_geral = django_filters.CharFilter(method='filter_busca_geral')
    
    # Filtro especial para técnicos: chamados abertos OU atribuídos ao técnico
    tecnico_ou_aberto = django_filters.NumberFilter(method='filter_tecnico_ou_aberto')
    
    class Meta:
        model = Chamado
        fields = {
            'status': ['exact', 'in'],
            'prioridade': ['exact', 'in'],
            'tipo_servico': ['exact'],
            'tecnico_responsavel': ['exact', 'isnull'],
            'solicitante': ['exact'],
            'criado_em': ['gte', 'lte', 'year', 'month'],
        }
    
    def filter_ultimos_dias(self, queryset, name, value):
        """Filtra chamados dos últimos X dias"""
        if value:
            from django.utils import timezone
            from datetime import timedelta
            data_limite = timezone.now() - timedelta(days=value)
            return queryset.filter(criado_em__gte=data_limite)
        return queryset
    
    def filter_busca_geral(self, queryset, name, value):
        """Busca em múltiplos campos"""
        if value:
            return queryset.filter(
                models.Q(numero__icontains=value) |
                models.Q(titulo__icontains=value) |
                models.Q(descricao__icontains=value) |
                models.Q(equipamento__icontains=value) |
                models.Q(localizacao__icontains=value)
            )
        return queryset

    def filter_tecnico_ou_aberto(self, queryset, name, value):
        """Filtra chamados abertos OU atribuídos ao técnico especificado"""
        if value:
            return queryset.filter(
                models.Q(status='aberto') |
                models.Q(tecnico_responsavel_id=value)
            )
        return queryset


class UsuarioFilter(django_filters.FilterSet):
    """Filtros customizados para usuários"""
    
    # Filtro por múltiplos tipos
    tipo_usuario_list = django_filters.MultipleChoiceFilter(
        field_name='tipo_usuario',
        choices=Usuario.TIPO_USUARIO_CHOICES
    )
    
    # Filtro por nome (busca parcial)
    nome = django_filters.CharFilter(field_name='nome_completo', lookup_expr='icontains')
    
    class Meta:
        model = Usuario
        fields = {
            'tipo_usuario': ['exact', 'in'],
            'ativo': ['exact'],
            'departamento': ['exact', 'icontains'],
            'date_joined': ['gte', 'lte'],
        }
