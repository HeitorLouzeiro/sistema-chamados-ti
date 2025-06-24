from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    """Admin para o modelo Usuario"""
    
    list_display = ('username', 'nome_completo', 'email', 'tipo_usuario', 'departamento', 'ativo', 'date_joined')
    list_filter = ('tipo_usuario', 'ativo', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('username', 'nome_completo', 'email', 'departamento')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Informações Adicionais', {
            'fields': ('tipo_usuario', 'nome_completo', 'departamento', 'telefone', 'ativo')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informações Adicionais', {
            'fields': ('tipo_usuario', 'nome_completo', 'email', 'departamento', 'telefone', 'ativo')
        }),
    )
