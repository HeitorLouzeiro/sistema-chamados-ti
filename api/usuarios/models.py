from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    """Modelo de usuário customizado"""
    
    TIPO_USUARIO_CHOICES = [
        ('admin', 'Administrador'),
        ('tecnico', 'Técnico'),
        ('usuario', 'Usuário'),
    ]
    
    tipo_usuario = models.CharField(
        max_length=10,
        choices=TIPO_USUARIO_CHOICES,
        default='usuario',
        verbose_name='Tipo de Usuário'
    )
    
    nome_completo = models.CharField(
        max_length=150,
        verbose_name='Nome Completo'
    )
    
    departamento = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Departamento'
    )
    
    telefone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Telefone'
    )
    
    ativo = models.BooleanField(
        default=True,
        verbose_name='Ativo'
    )
    
    criado_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    
    atualizado_em = models.DateTimeField(
        auto_now=True,
        verbose_name='Atualizado em'
    )
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        db_table = 'usuarios'
    
    def __str__(self):
        return f"{self.nome_completo} ({self.username})"
    
    @property
    def iniciais(self):
        """Retorna as iniciais do nome"""
        nomes = self.nome_completo.split()
        if len(nomes) >= 2:
            return f"{nomes[0][0]}{nomes[-1][0]}".upper()
        elif len(nomes) == 1:
            return nomes[0][:2].upper()
        return "US"
