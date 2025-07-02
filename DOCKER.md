# 🐳 Docker Setup - Sistema de Chamados TI

## 🚀 Como usar

### Primeira execução:

```bash
# 1. Construir os containers
docker compose build

# 2. Subir todos os serviços
docker compose up -d

# 3. Executar migrações do banco
docker compose exec backend python manage.py migrate

# 4. Criar superusuário (opcional)
docker compose exec backend python manage.py criar_dados_exemplos
```

### Uso diário:

```bash
# Subir ambiente
docker compose up -d

# Ver logs de todos os serviços
docker compose logs -f

# Ver logs específicos
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Parar ambiente
docker compose down
```

### Comandos úteis:

```bash
# Reconstruir containers (após mudanças no Dockerfile)
docker compose build --no-cache

# Reset completo (apaga volumes do banco)
docker compose down -v

# Acessar shell do Django
docker compose exec backend python manage.py shell

# Acessar bash do container backend
docker compose exec backend bash

# Executar comandos Django
docker compose exec backend python manage.py collectstatic
docker compose exec backend python manage.py makemigrations
```

## 🌐 Endpoints

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Django**: http://localhost:8000/admin
- **Swagger Docs**: http://localhost:8000/api/docs/
- **PostgreSQL**: localhost:5432 (usuário: postgres, senha: postgres123)

## 🔧 Estrutura

- **db**: PostgreSQL 15
- **backend**: Django + DRF (porta 8000)
- **frontend**: Next.js (porta 3000)

## 💡 Dicas

- Os volumes estão mapeados, então mudanças no código refletem automaticamente
- O banco PostgreSQL persiste dados mesmo quando você para os containers
- Use `docker compose down -v` se quiser limpar completamente o banco de dados
- Os logs ficam disponíveis em tempo real com `docker compose logs -f`

## 🐛 Troubleshooting

Se der algum problema:

1. Pare tudo: `docker compose down`
2. Reconstrua: `docker compose build --no-cache`
3. Suba novamente: `docker compose up -d`
4. Execute migrações: `docker compose exec backend python manage.py migrate`

## 🔍 Status dos serviços

```bash
# Ver status
docker compose ps

# Ver recursos usados
docker compose top
```