from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from chamados.models import TipoServico, Chamado
from django.utils import timezone

Usuario = get_user_model()


class Command(BaseCommand):
    help = 'Cria dados de exemplo para o sistema'

    def handle(self, *args, **options):
        self.stdout.write('Criando dados de exemplo...')

        # Criar superusuário se não existir
        if not Usuario.objects.filter(username='admin').exists():
            admin = Usuario.objects.create_superuser(
                username='admin',
                email='admin@prefeitura.gov.br',
                password='admin123',
                nome_completo='Administrador do Sistema',
                tipo_usuario='admin',
                departamento='TI'
            )
            self.stdout.write(f'Superusuário criado: {admin.username}')

        # Criar usuários de exemplo
        usuarios_exemplo = [
            {
                'username': 'carlos.silva',
                'email': 'carlos.silva@prefeitura.gov.br',
                'nome_completo': 'Carlos Silva',
                'tipo_usuario': 'tecnico',
                'departamento': 'TI',
                'telefone': '(11) 99999-1111'
            },
            {
                'username': 'ana.santos',
                'email': 'ana.santos@prefeitura.gov.br',
                'nome_completo': 'Ana Santos',
                'tipo_usuario': 'tecnico',
                'departamento': 'TI',
                'telefone': '(11) 99999-2222'
            },
            {
                'username': 'joao.oliveira',
                'email': 'joao.oliveira@prefeitura.gov.br',
                'nome_completo': 'João Oliveira',
                'tipo_usuario': 'tecnico',
                'departamento': 'TI',
                'telefone': '(11) 99999-3333'
            },
            {
                'username': 'maria.costa',
                'email': 'maria.costa@prefeitura.gov.br',
                'nome_completo': 'Maria Costa',
                'tipo_usuario': 'usuario',
                'departamento': 'Administrativo',
                'telefone': '(11) 99999-4444'
            },
            {
                'username': 'pedro.souza',
                'email': 'pedro.souza@prefeitura.gov.br',
                'nome_completo': 'Pedro Souza',
                'tipo_usuario': 'usuario',
                'departamento': 'RH',
                'telefone': '(11) 99999-5555'
            }
        ]

        for dados_usuario in usuarios_exemplo:
            if not Usuario.objects.filter(username=dados_usuario['username']).exists():
                usuario = Usuario.objects.create_user(
                    password='123456',
                    **dados_usuario
                )
                self.stdout.write(f'Usuário criado: {usuario.username}')

        # Criar tipos de serviço
        tipos_servico = [
            {
                'nome': 'Manutenção de Hardware',
                'descricao': 'Reparos e manutenção de equipamentos de informática'
            },
            {
                'nome': 'Suporte Técnico',
                'descricao': 'Suporte técnico geral para usuários'
            },
            {
                'nome': 'Configuração de Sistema',
                'descricao': 'Configuração e instalação de sistemas e softwares'
            },
            {
                'nome': 'Problemas de Rede',
                'descricao': 'Resolução de problemas de conectividade e rede'
            },
            {
                'nome': 'Instalação de Software',
                'descricao': 'Instalação e configuração de softwares'
            }
        ]

        for dados_tipo in tipos_servico:
            tipo_servico, created = TipoServico.objects.get_or_create(
                nome=dados_tipo['nome'],
                defaults={'descricao': dados_tipo['descricao']}
            )
            if created:
                self.stdout.write(f'Tipo de serviço criado: {tipo_servico.nome}')

        # Criar chamados de exemplo
        if not Chamado.objects.exists():
            # Buscar usuários
            carlos = Usuario.objects.get(username='carlos.silva')
            ana = Usuario.objects.get(username='ana.santos')
            joao = Usuario.objects.get(username='joao.oliveira')
            maria = Usuario.objects.get(username='maria.costa')
            pedro = Usuario.objects.get(username='pedro.souza')

            # Buscar tipos de serviço
            manutencao = TipoServico.objects.get(nome='Manutenção de Hardware')
            suporte = TipoServico.objects.get(nome='Suporte Técnico')
            configuracao = TipoServico.objects.get(nome='Configuração de Sistema')

            chamados_exemplo = [
                {
                    'titulo': 'Computador não liga',
                    'descricao': 'O computador da estação de trabalho não está ligando. Já verificamos o cabo de energia e está conectado corretamente.',
                    'tipo_servico': manutencao,
                    'status': 'em_atendimento',
                    'prioridade': 'alta',
                    'equipamento': 'Computador Desktop',
                    'localizacao': 'Sala 101 - Departamento Administrativo',
                    'solicitante': maria,
                    'tecnico_responsavel': carlos,
                    'observacoes_tecnico': 'Verificado problema na fonte de alimentação. Substituição necessária.'
                },
                {
                    'titulo': 'Impressora com papel atolado',
                    'descricao': 'A impressora HP LaserJet Pro está com papel atolado constantemente.',
                    'tipo_servico': suporte,
                    'status': 'aberto',
                    'prioridade': 'media',
                    'equipamento': 'Impressora HP LaserJet Pro',
                    'localizacao': 'Sala 205 - Departamento de RH',
                    'solicitante': pedro,
                    'tecnico_responsavel': ana
                },
                {
                    'titulo': 'Email não está funcionando',
                    'descricao': 'Não estou conseguindo enviar nem receber emails. A mensagem de erro indica problema de autenticação.',
                    'tipo_servico': configuracao,
                    'status': 'encerrado',
                    'prioridade': 'media',
                    'equipamento': 'Outlook 2021',
                    'localizacao': 'Sala 150 - Diretoria',
                    'solicitante': maria,
                    'tecnico_responsavel': joao,
                    'observacoes_tecnico': 'Problema resolvido. Reconfigurada a conta de email.'
                }
            ]

            for dados_chamado in chamados_exemplo:
                chamado = Chamado.objects.create(**dados_chamado)
                self.stdout.write(f'Chamado criado: #{chamado.numero} - {chamado.titulo}')

        self.stdout.write(
            self.style.SUCCESS('Dados de exemplo criados com sucesso!')
        )
        self.stdout.write('Usuários criados:')
        self.stdout.write('- admin / admin123 (administrador)')
        self.stdout.write('- carlos.silva / 123456 (técnico)')
        self.stdout.write('- ana.santos / 123456 (técnico)')
        self.stdout.write('- joao.oliveira / 123456 (técnico)')
        self.stdout.write('- maria.costa / 123456 (usuário)')
        self.stdout.write('- pedro.souza / 123456 (usuário)')
