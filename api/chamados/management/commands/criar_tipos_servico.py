from django.core.management.base import BaseCommand
from chamados.models import TipoServico


class Command(BaseCommand):
    help = 'Cria tipos de serviço padrão'

    def handle(self, *args, **options):
        tipos_servico = [
            {
                'nome': 'Instalação de Rede',
                'descricao': 'Instalação e configuração de redes cabeadas e wireless'
            },
            {
                'nome': 'Manutenção de Hardware',
                'descricao': 'Reparo e manutenção de computadores e periféricos'
            },
            {
                'nome': 'Suporte de Software',
                'descricao': 'Instalação, configuração e suporte de softwares'
            },
            {
                'nome': 'Recuperação de Dados',
                'descricao': 'Recuperação de arquivos e dados perdidos'
            },
            {
                'nome': 'Configuração de Sistema',
                'descricao': 'Configuração de sistemas operacionais e aplicações'
            },
            {
                'nome': 'Backup e Restore',
                'descricao': 'Serviços de backup e restauração de dados'
            },
            {
                'nome': 'Instalação de Impressora',
                'descricao': 'Instalação e configuração de impressoras e multifuncionais'
            },
            {
                'nome': 'Suporte Remoto',
                'descricao': 'Atendimento remoto para resolução de problemas'
            },
            {
                'nome': 'Segurança da Informação',
                'descricao': 'Implementação de medidas de segurança digital'
            },
            {
                'nome': 'Telefonia',
                'descricao': 'Suporte para sistemas de telefonia e comunicação'
            }
        ]

        tipos_criados = 0
        for tipo_data in tipos_servico:
            tipo, created = TipoServico.objects.get_or_create(
                nome=tipo_data['nome'],
                defaults={
                    'descricao': tipo_data['descricao'],
                    'ativo': True
                }
            )
            
            if created:
                tipos_criados += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Tipo de serviço criado: {tipo.nome}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Tipo de serviço já existe: {tipo.nome}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Comando executado com sucesso! {tipos_criados} tipos de serviço criados.')
        )
