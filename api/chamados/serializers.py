from rest_framework import serializers
from .models import TipoServico, Chamado, AnexoChamado, HistoricoChamado
from usuarios.serializers import UsuarioListSerializer, TecnicoSerializer


class TipoServicoSerializer(serializers.ModelSerializer):
    """Serializer para TipoServico"""
    
    class Meta:
        model = TipoServico
        fields = ['id', 'nome', 'descricao', 'ativo']


class AnexoChamadoSerializer(serializers.ModelSerializer):
    """Serializer para AnexoChamado"""
    
    tamanho_formatado = serializers.ReadOnlyField()
    enviado_por = UsuarioListSerializer(read_only=True)
    
    class Meta:
        model = AnexoChamado
        fields = [
            'id', 'arquivo', 'nome_original', 'tamanho', 'tamanho_formatado',
            'tipo_arquivo', 'enviado_por', 'criado_em'
        ]
        read_only_fields = ['id', 'tamanho', 'tipo_arquivo', 'criado_em']


class HistoricoChamadoSerializer(serializers.ModelSerializer):
    """Serializer para HistoricoChamado"""
    
    usuario = UsuarioListSerializer(read_only=True)
    tipo_acao_display = serializers.CharField(source='get_tipo_acao_display', read_only=True)
    
    class Meta:
        model = HistoricoChamado
        fields = [
            'id', 'tipo_acao', 'tipo_acao_display', 'descricao',
            'usuario', 'criado_em'
        ]
        read_only_fields = ['id', 'criado_em']


class ChamadoListSerializer(serializers.ModelSerializer):
    """Serializer para listagem de chamados"""
    
    tipo_servico_nome = serializers.CharField(source='tipo_servico.nome', read_only=True)
    solicitante_nome = serializers.CharField(source='solicitante.nome_completo', read_only=True)
    tecnico_responsavel = TecnicoSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    prioridade_display = serializers.CharField(source='get_prioridade_display', read_only=True)
    
    class Meta:
        model = Chamado
        fields = [
            'id', 'numero', 'titulo', 'tipo_servico_nome', 'status', 'status_display',
            'prioridade', 'prioridade_display', 'solicitante_nome', 'tecnico_responsavel',
            'criado_em', 'atualizado_em'
        ]


class ChamadoDetailSerializer(serializers.ModelSerializer):
    """Serializer detalhado para chamados"""
    
    tipo_servico = TipoServicoSerializer(read_only=True)
    solicitante = UsuarioListSerializer(read_only=True)
    tecnico_responsavel = TecnicoSerializer(read_only=True)
    anexos = AnexoChamadoSerializer(many=True, read_only=True)
    historico = HistoricoChamadoSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    prioridade_display = serializers.CharField(source='get_prioridade_display', read_only=True)
    
    class Meta:
        model = Chamado
        fields = [
            'id', 'numero', 'titulo', 'descricao', 'tipo_servico', 'status',
            'status_display', 'prioridade', 'prioridade_display', 'equipamento',
            'localizacao', 'solicitante', 'tecnico_responsavel', 'observacoes_tecnico',
            'anexos', 'historico', 'criado_em', 'atualizado_em', 'atendido_em',
            'encerrado_em'
        ]


class ChamadoCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de chamados"""
    
    class Meta:
        model = Chamado
        fields = [
            'titulo', 'descricao', 'tipo_servico', 'prioridade',
            'equipamento', 'localizacao'
        ]
    
    def create(self, validated_data):
        # O solicitante será definido automaticamente na view
        return super().create(validated_data)


class ChamadoUpdateSerializer(serializers.ModelSerializer):
    """Serializer para atualização de chamados"""
    
    class Meta:
        model = Chamado
        fields = [
            'titulo', 'descricao', 'tipo_servico', 'status', 'prioridade',
            'equipamento', 'localizacao', 'tecnico_responsavel', 'observacoes_tecnico'
        ]
    
    def validate_tecnico_responsavel(self, value):
        """Valida se o usuário é realmente um técnico"""
        if value and value.tipo_usuario != 'tecnico':
            raise serializers.ValidationError("O usuário selecionado não é um técnico.")
        return value


class ChamadoStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer para atualização apenas do status"""
    
    class Meta:
        model = Chamado
        fields = ['status', 'observacoes_tecnico']


class AnexoChamadoUploadSerializer(serializers.ModelSerializer):
    """Serializer para upload de anexos"""
    
    class Meta:
        model = AnexoChamado
        fields = ['arquivo']
    
    def create(self, validated_data):
        arquivo = validated_data['arquivo']
        validated_data['nome_original'] = arquivo.name
        validated_data['tamanho'] = arquivo.size
        validated_data['tipo_arquivo'] = arquivo.content_type or 'application/octet-stream'
        return super().create(validated_data)
