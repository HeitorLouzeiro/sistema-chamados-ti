# Sistema de Chamados TI - API

API Django REST Framework para gerenciamento de chamados de TI da Prefeitura.

## 🚀 Características

- **Autenticação**: Sistema de autenticação baseado em sessão
- **Modelos em Português**: Todas as variáveis e campos em português
- **Três tipos de usuário**: Administrador, Técnico e Usuário
- **Gestão completa de chamados**: Criação, atualização, anexos e histórico
- **Documentação automática**: Swagger/OpenAPI integrado
- **Upload de anexos**: Suporte para múltiplos anexos por chamado

## 📊 Modelos

### Usuario
- Modelo customizado baseado no AbstractUser
- Campos: nome_completo, tipo_usuario, departamento, telefone
- Tipos: admin, tecnico, usuario

### Chamado
- Gestão completa de chamados de TI
- Status: aberto, em_atendimento, encerrado, cancelado
- Prioridades: baixa, media, alta, urgente
- Numeração automática
- Relacionamentos com solicitante e técnico responsável

### TipoServico
- Categorização dos tipos de serviço
- Facilita a organização dos chamados

### AnexoChamado
- Upload de múltiplos anexos por chamado
- Controle de tamanho e tipo de arquivo

### HistoricoChamado
- Rastreamento de todas as alterações
- Auditoria completa das ações

## 🛠️ Instalação

1. **Clone o repositório**:
```bash
cd sistema-chamados-ti/api
```

2. **Crie e ative o ambiente virtual**:
```bash
python3 -m venv venv
source venv/bin/activate
```

3. **Instale as dependências**:
```bash
pip install -r requirements.txt
```

4. **Configure o ambiente**:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

5. **Execute as migrações**:
```bash
python manage.py migrate
```

6. **Crie dados de exemplo**:
```bash
python manage.py criar_dados_exemplo
```

7. **Inicie o servidor**:
```bash
python manage.py runserver
```

## 📝 Usuários de Exemplo

Após executar o comando `criar_dados_exemplo`, os seguintes usuários estarão disponíveis:

- **admin** / admin123 (Administrador)
- **carlos.silva** / 123456 (Técnico)
- **ana.santos** / 123456 (Técnico)
- **joao.oliveira** / 123456 (Técnico)
- **maria.costa** / 123456 (Usuário)
- **pedro.souza** / 123456 (Usuário)

## 🔗 Endpoints Principais

### Autenticação
- `POST /admin/login/` - Login no Django Admin

### Usuários
- `GET /api/usuarios/` - Listar usuários
- `POST /api/usuarios/` - Criar usuário
- `GET /api/usuarios/{id}/` - Detalhar usuário
- `GET /api/usuarios/tecnicos/` - Listar técnicos
- `GET /api/usuarios/perfil/` - Perfil do usuário logado

### Chamados
- `GET /api/chamados/` - Listar chamados
- `POST /api/chamados/` - Criar chamado
- `GET /api/chamados/{id}/` - Detalhar chamado
- `PUT /api/chamados/{id}/` - Atualizar chamado
- `PATCH /api/chamados/{id}/status/` - Atualizar status
- `GET /api/chamados/meus-chamados/` - Chamados do usuário
- `GET /api/chamados/chamados-tecnico/` - Chamados do técnico
- `GET /api/chamados/estatisticas/` - Estatísticas do dashboard

### Anexos
- `POST /api/chamados/{id}/anexos/` - Upload de anexo
- `DELETE /api/chamados/anexos/{id}/` - Deletar anexo

### Tipos de Serviço
- `GET /api/chamados/tipos-servico/` - Listar tipos de serviço

## 📖 Documentação

A documentação interativa está disponível em:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Schema JSON**: http://localhost:8000/api/schema/

## 🛡️ Permissões

- **Administradores**: Acesso total ao sistema
- **Técnicos**: Podem visualizar todos os chamados, editar chamados atribuídos
- **Usuários**: Podem criar chamados e visualizar seus próprios chamados

## 📱 Integração com Frontend

Esta API foi projetada para ser consumida pelo frontend Next.js. Principais características:

- **CORS configurado** para localhost:3000
- **Serializers estruturados** para fácil consumo
- **Filtros e busca** em todos os endpoints de listagem
- **Paginação automática** configurada

## 🔧 Configurações

### Variáveis de Ambiente (.env)

```env
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```

### Configurações de Produção

Para produção, recomenda-se:

1. Configurar banco PostgreSQL
2. Configurar servidor de arquivos (AWS S3, etc.)
3. Configurar cache (Redis)
4. Configurar variáveis de ambiente seguras

## 🧪 Testes

```bash
python manage.py test
```

## 📦 Deploy

### Docker (Recomendado)

```dockerfile
# Dockerfile já está configurado para produção
docker build -t sistema-chamados-api .
docker run -p 8000:8000 sistema-chamados-api
```

### Manual

1. Configure o servidor web (nginx + gunicorn)
2. Configure variáveis de ambiente
3. Execute collectstatic
4. Configure banco de dados de produção

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
