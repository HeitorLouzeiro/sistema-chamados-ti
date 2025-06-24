from rest_framework import serializers
from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para Usuario"""
    
    iniciais = serializers.ReadOnlyField()
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'nome_completo', 'tipo_usuario',
            'departamento', 'telefone', 'ativo', 'iniciais',
            'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['id', 'criado_em', 'atualizado_em']


class UsuarioCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de Usuario"""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'nome_completo', 'tipo_usuario', 'departamento', 'telefone'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        usuario = Usuario.objects.create_user(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario


class UsuarioListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de usuários"""
    
    iniciais = serializers.ReadOnlyField()
    
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'nome_completo', 'tipo_usuario', 'iniciais']


class TecnicoSerializer(serializers.ModelSerializer):
    """Serializer para técnicos"""
    
    iniciais = serializers.ReadOnlyField()
    
    class Meta:
        model = Usuario
        fields = ['id', 'nome_completo', 'iniciais', 'email', 'telefone']
