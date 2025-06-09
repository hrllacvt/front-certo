# Salgados da Sara - Backend API

Este é o backend em PHP com PostgreSQL para o sistema de pedidos "Salgados da Sara".

## Requisitos

- PHP 7.4 ou superior
- PostgreSQL 12 ou superior
- Apache/Nginx com mod_rewrite habilitado
- Extensões PHP: pdo, pdo_pgsql, json

## Instalação

1. **Configure o banco de dados:**
   ```bash
   # Conecte ao PostgreSQL
   psql -U postgres
   
   # Crie o banco de dados
   CREATE DATABASE salgados_da_sara;
   
   # Execute o schema
   psql -U postgres -d salgados_da_sara -f database/schema.sql
   ```

2. **Configure a conexão com o banco:**
   Edite o arquivo `config/database.php` com suas credenciais:
   ```php
   private $host = 'localhost';
   private $db_name = 'salgados_da_sara';
   private $username = 'seu_usuario';
   private $password = 'sua_senha';
   private $port = '5432';
   ```

3. **Configure o servidor web:**
   - Aponte o DocumentRoot para a pasta `backend/`
   - Certifique-se de que o mod_rewrite está habilitado
   - O arquivo `.htaccess` já está configurado

## Estrutura da API

### Autenticação

- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/forgot-password` - Recuperação de senha
- `POST /api/auth/admin-login` - Login de administrador

### Produtos

- `GET /api/products` - Listar produtos
- `POST /api/products/create` - Criar produto (admin)
- `POST /api/products/update` - Atualizar produto (admin)
- `POST /api/products/delete` - Excluir produto (admin)

### Pedidos

- `GET /api/orders` - Listar pedidos
- `GET /api/orders?user_id=X` - Listar pedidos de um usuário
- `POST /api/orders/create` - Criar pedido
- `POST /api/orders/update-status` - Atualizar status do pedido (admin)

### Administração

- `GET /api/admin/admins` - Listar administradores
- `POST /api/admin/admins` - Criar administrador
- `DELETE /api/admin/admins` - Excluir administrador

### Configurações

- `GET /api/config` - Obter configurações
- `GET /api/config?key=delivery_fee` - Obter configuração específica
- `POST /api/config` - Atualizar configuração

## Exemplos de Uso

### Login de usuário
```javascript
fetch('/api/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        phone: '(54) 99999-9999',
        password: 'senha123'
    })
})
```

### Criar pedido
```javascript
fetch('/api/orders/create', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        user_id: 1,
        customer_data: {
            name: 'João Silva',
            phone: '(54) 99999-9999',
            address: 'Rua das Flores, 123'
        },
        items: [
            {
                id: 1,
                name: 'Coxinha frango',
                quantity: 1,
                quantityType: 'cento',
                totalPrice: 110.00
            }
        ],
        subtotal: 110.00,
        delivery_fee: 10.00,
        total: 120.00,
        is_delivery: true,
        payment_method: 'cash'
    })
})
```

## Segurança

- Todas as senhas são criptografadas com `password_hash()`
- Validação de entrada em todos os endpoints
- Proteção contra SQL Injection usando prepared statements
- Headers CORS configurados para desenvolvimento

## Usuário Administrador Padrão

- **Usuário:** sara
- **Senha:** password

**IMPORTANTE:** Altere a senha padrão em produção!

## Estrutura do Banco de Dados

### Tabelas principais:
- `users` - Usuários do sistema
- `admin_users` - Administradores
- `products` - Produtos do cardápio
- `orders` - Pedidos
- `order_status_history` - Histórico de status dos pedidos
- `app_config` - Configurações do sistema

## Status dos Pedidos

- `pending` - Aguardando confirmação
- `confirmed` - Em preparação
- `ready` - Pronto
- `delivered` - Entregue
- `rejected` - Recusado

## Desenvolvimento

Para desenvolvimento local, você pode usar o servidor embutido do PHP:

```bash
cd backend
php -S localhost:8000
```

A API estará disponível em `http://localhost:8000/api/`