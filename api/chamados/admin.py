from django.contrib import admin
from .models import TipoServico, Chamado, AnexoChamado, HistoricoChamado


@admin.register(TipoServico)
class TipoServicoAdmin(admin.ModelAdmin):
    """Admin para TipoServico"""
    
    list_display = ('nome', 'ativo', 'criado_em')
    list_filter = ('ativo', 'criado_em')
    search_fields = ('nome', 'descricao')
    ordering = ('nome',)


class AnexoChamadoInline(admin.TabularInline):
    """Inline para anexos do chamado"""
    model = AnexoChamado
    extra = 0
    readonly_fields = ('tamanho_formatado', 'criado_em')


class HistoricoChamadoInline(admin.TabularInline):
    """Inline para histórico do chamado"""
    model = HistoricoChamado
    extra = 0
    readonly_fields = ('criado_em',)


@admin.register(Chamado)
class ChamadoAdmin(admin.ModelAdmin):
    """Admin para Chamado"""
    
    list_display = ('numero', 'titulo', 'tipo_servico', 'status', 'prioridade', 'solicitante', 'tecnico_responsavel', 'criado_em')
    list_filter = ('status', 'prioridade', 'tipo_servico', 'criado_em', 'tecnico_responsavel')
    search_fields = ('numero', 'titulo', 'descricao', 'solicitante__nome_completo')
    ordering = ('-criado_em',)
    readonly_fields = ('numero', 'criado_em', 'atualizado_em', 'atendido_em', 'encerrado_em')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('numero', 'titulo', 'descricao', 'tipo_servico')
        }),
        ('Status e Prioridade', {
            'fields': ('status', 'prioridade')
        }),
        ('Equipamento', {
            'fields': ('equipamento', 'localizacao')
        }),
        ('Responsáveis', {
            'fields': ('solicitante', 'tecnico_responsavel')
        }),
        ('Observações', {
            'fields': ('observacoes_tecnico',)
        }),
        ('Datas', {
            'fields': ('criado_em', 'atualizado_em', 'atendido_em', 'encerrado_em'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [AnexoChamadoInline, HistoricoChamadoInline]


@admin.register(AnexoChamado)
class AnexoChamadoAdmin(admin.ModelAdmin):
    """Admin para AnexoChamado"""
    
    list_display = ('nome_original', 'chamado', 'tamanho_formatado', 'enviado_por', 'criado_em')
    list_filter = ('tipo_arquivo', 'criado_em')
    search_fields = ('nome_original', 'chamado__numero', 'chamado__titulo')
    ordering = ('-criado_em',)


@admin.register(HistoricoChamado)
class HistoricoChamadoAdmin(admin.ModelAdmin):
    """Admin para HistoricoChamado"""
    
    list_display = ('chamado', 'tipo_acao', 'usuario', 'criado_em')
    list_filter = ('tipo_acao', 'criado_em')
    search_fields = ('chamado__numero', 'descricao')
    ordering = ('-criado_em',)
    readonly_fields = ('criado_em',)
