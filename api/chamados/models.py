from django.db import models
from django.conf import settings
import os


class TipoServico(models.Model):
    """Modelo para tipos de serviço"""
    
    nome = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Nome do Serviço'
    )
    
    descricao = models.TextField(
        blank=True,
        null=True,
        verbose_name='Descrição'
    )
    
    ativo = models.BooleanField(
        default=True,
        verbose_name='Ativo'
    )
    
    criado_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    
    class Meta:
        verbose_name = 'Tipo de Serviço'
        verbose_name_plural = 'Tipos de Serviço'
        db_table = 'tipos_servico'
        ordering = ['nome']
    
    def __str__(self):
        return self.nome


class Chamado(models.Model):
    """Modelo para chamados de TI"""
    
    STATUS_CHOICES = [
        ('aberto', 'Aberto'),
        ('em_atendimento', 'Em Atendimento'),
        ('encerrado', 'Encerrado'),
        ('cancelado', 'Cancelado'),
    ]
    
    PRIORIDADE_CHOICES = [
        ('baixa', 'Baixa'),
        ('media', 'Média'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]
    
    # Campos básicos
    numero = models.CharField(
        max_length=10,
        unique=True,
        verbose_name='Número do Chamado'
    )
    
    titulo = models.CharField(
        max_length=200,
        verbose_name='Título'
    )
    
    descricao = models.TextField(
        verbose_name='Descrição'
    )
    
    tipo_servico = models.ForeignKey(
        TipoServico,
        on_delete=models.PROTECT,
        verbose_name='Tipo de Serviço'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='aberto',
        verbose_name='Status'
    )
    
    prioridade = models.CharField(
        max_length=10,
        choices=PRIORIDADE_CHOICES,
        default='media',
        verbose_name='Prioridade'
    )
    
    # Informações do equipamento
    equipamento = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        verbose_name='Equipamento'
    )
    
    localizacao = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Localização'
    )
    
    # Relacionamentos
    solicitante = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='chamados_solicitados',
        verbose_name='Solicitante'
    )
    
    tecnico_responsavel = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='chamados_atribuidos',
        blank=True,
        null=True,
        limit_choices_to={'tipo_usuario': 'tecnico'},
        verbose_name='Técnico Responsável'
    )
    
    # Observações técnicas
    observacoes_tecnico = models.TextField(
        blank=True,
        null=True,
        verbose_name='Observações do Técnico'
    )
    
    # Datas
    criado_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    
    atualizado_em = models.DateTimeField(
        auto_now=True,
        verbose_name='Atualizado em'
    )
    
    atendido_em = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Atendido em'
    )
    
    encerrado_em = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Encerrado em'
    )
    
    class Meta:
        verbose_name = 'Chamado'
        verbose_name_plural = 'Chamados'
        db_table = 'chamados'
        ordering = ['-criado_em']
    
    def __str__(self):
        return f"#{self.numero} - {self.titulo}"
    
    def save(self, *args, **kwargs):
        # Gerar número automático se não existir
        if not self.numero:
            ultimo_numero = Chamado.objects.filter(
                numero__isnull=False
            ).order_by('-numero').first()
            
            if ultimo_numero and ultimo_numero.numero:
                try:
                    proximo_numero = int(ultimo_numero.numero) + 1
                except (ValueError, TypeError):
                    proximo_numero = 1
            else:
                proximo_numero = 1
            
            self.numero = str(proximo_numero).zfill(5)
        
        # Atualizar datas baseadas no status
        if self.pk:  # Se já existe
            try:
                chamado_anterior = Chamado.objects.get(pk=self.pk)
                
                # Se mudou para em_atendimento e não tinha data de atendimento
                if (self.status == 'em_atendimento' and 
                    chamado_anterior.status != 'em_atendimento' and 
                    not self.atendido_em):
                    from django.utils import timezone
                    self.atendido_em = timezone.now()
                
                # Se mudou para encerrado e não tinha data de encerramento
                if (self.status == 'encerrado' and 
                    chamado_anterior.status != 'encerrado' and 
                    not self.encerrado_em):
                    from django.utils import timezone
                    self.encerrado_em = timezone.now()
            except Chamado.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)


def upload_anexo_path(instance, filename):
    """Define o caminho para upload de anexos"""
    return f'chamados/{instance.chamado.numero}/anexos/{filename}'


class AnexoChamado(models.Model):
    """Modelo para anexos dos chamados"""
    
    chamado = models.ForeignKey(
        Chamado,
        on_delete=models.CASCADE,
        related_name='anexos',
        verbose_name='Chamado'
    )
    
    arquivo = models.FileField(
        upload_to=upload_anexo_path,
        verbose_name='Arquivo'
    )
    
    nome_original = models.CharField(
        max_length=255,
        verbose_name='Nome Original'
    )
    
    tamanho = models.PositiveIntegerField(
        verbose_name='Tamanho (bytes)'
    )
    
    tipo_arquivo = models.CharField(
        max_length=50,
        verbose_name='Tipo do Arquivo'
    )
    
    enviado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        verbose_name='Enviado por'
    )
    
    criado_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Enviado em'
    )
    
    class Meta:
        verbose_name = 'Anexo do Chamado'
        verbose_name_plural = 'Anexos dos Chamados'
        db_table = 'anexos_chamados'
        ordering = ['-criado_em']
    
    def __str__(self):
        return f"{self.nome_original} - Chamado #{self.chamado.numero}"
    
    @property
    def tamanho_formatado(self):
        """Retorna o tamanho formatado em MB, KB ou bytes"""
        if not self.tamanho or self.tamanho == 0:
            return "0 bytes"
        
        if self.tamanho >= 1024 * 1024:
            return f"{self.tamanho / (1024 * 1024):.1f} MB"
        elif self.tamanho >= 1024:
            return f"{self.tamanho / 1024:.1f} KB"
        else:
            return f"{self.tamanho} bytes"
    
    def delete(self, *args, **kwargs):
        # Deletar arquivo físico ao deletar o registro
        if self.arquivo:
            if os.path.isfile(self.arquivo.path):
                os.remove(self.arquivo.path)
        super().delete(*args, **kwargs)


class HistoricoChamado(models.Model):
    """Modelo para histórico de alterações dos chamados"""
    
    TIPO_ACAO_CHOICES = [
        ('criado', 'Chamado Criado'),
        ('status_alterado', 'Status Alterado'),
        ('tecnico_atribuido', 'Técnico Atribuído'),
        ('tecnico_removido', 'Técnico Removido'),
        ('observacao_adicionada', 'Observação Adicionada'),
        ('anexo_adicionado', 'Anexo Adicionado'),
        ('anexo_removido', 'Anexo Removido'),
    ]
    
    chamado = models.ForeignKey(
        Chamado,
        on_delete=models.CASCADE,
        related_name='historico',
        verbose_name='Chamado'
    )
    
    tipo_acao = models.CharField(
        max_length=30,
        choices=TIPO_ACAO_CHOICES,
        verbose_name='Tipo da Ação'
    )
    
    descricao = models.TextField(
        verbose_name='Descrição'
    )
    
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        verbose_name='Usuário'
    )
    
    criado_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data da Ação'
    )
    
    class Meta:
        verbose_name = 'Histórico do Chamado'
        verbose_name_plural = 'Histórico dos Chamados'
        db_table = 'historico_chamados'
        ordering = ['-criado_em']
    
    def __str__(self):
        return f"#{self.chamado.numero} - {self.get_tipo_acao_display()}"
