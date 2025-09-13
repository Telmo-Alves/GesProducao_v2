# Sistema de Gestão de Produção - Tinturaria e Estamparia

Sistema completo para gestão de produção industrial desenvolvido com Node.js + React + TypeScript.

## 🚀 Características

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Tailwind CSS
- **Base de Dados**: Firebird 2.5
- **Autenticação**: JWT
- **Configuração**: Ficheiros INI
- **Deployment**: Apache + PM2

## 📁 Estrutura do Projeto

```
gesproducao_v2/
├── src/                    # Backend (Node.js)
│   ├── controllers/        # Controladores da API
│   ├── services/          # Lógica de negócio
│   ├── middleware/        # Middlewares
│   ├── routes/            # Rotas da API
│   ├── config/            # Configurações
│   └── types/             # Tipos TypeScript
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── contexts/      # Contextos React
│   │   ├── services/      # APIs do cliente
│   │   └── types/         # Tipos TypeScript
├── config.ini             # Configurações das BDs
└── gesproducao.conf       # Configuração Apache
```

## 🛠️ Instalação

### 1. Pré-requisitos
```bash
# Node.js 18+
# Apache 2.4+
# Firebird 2.5
```

### 2. Instalar dependências
```bash
# Backend
npm install

# Frontend
cd client
npm install
```

### 3. Configurar Apache
```bash
# Copiar configuração
sudo cp gesproducao.conf /etc/apache2/sites-available/
sudo a2ensite gesproducao
sudo a2enmod rewrite proxy proxy_http headers expires deflate
sudo systemctl restart apache2
```

### 4. Configurar ambiente
```bash
# Copiar e editar variáveis de ambiente
cp .env.example .env
```

## 🚀 Execução

### Desenvolvimento
```bash
# Executar ambos (backend + frontend)
npm run dev

# Apenas backend
npm run server:dev

# Apenas frontend
cd client && npm run dev
```

### Produção
```bash
# Build do projeto
npm run build

# Instalar PM2
npm install -g pm2

# Executar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📊 Funcionalidades

### ✅ Implementado
- [x] Sistema de autenticação JWT
- [x] Gestão de utilizadores
- [x] Configurações dinâmicas (INI)
- [x] Interface responsiva
- [x] Sidebar com navegação
- [x] Dashboard principal

### 🚧 Em Desenvolvimento
- [ ] Módulo Tinturaria
- [ ] Módulo Laboratório
- [ ] Módulo Estamparia
- [ ] Sincronizações
- [ ] Relatórios

## 🗂️ Módulos Planeados

### Tinturaria
- Recepção de mercadoria
- Processo de tinturaria
- Acabamento
- Entregas
- Definições

### Laboratório
- Registo de cores
- Registo de receitas
- Tabela de clientes
- Tabela de corantes
- Tabela de auxiliares

### Estamparia
- Recepção
- Tabela de desenhos
- Concluídos

### Sincronizações
- Sincronizar clientes
- Sincronizar auxiliares

### Tabelas
- Clientes
- Artigos
- Composições

## 👥 Gestão de Utilizadores

### Níveis de Acesso
- **Admin**: Acesso completo
- **Operator**: Operações de produção
- **Viewer**: Apenas visualização

### Campos de Utilizador
- Username
- Email
- Role (admin/operator/viewer)
- Secção
- Status (ativo/inativo)
- Administrador (S/N)

## 🔧 API Endpoints

```
POST   /api/auth/login          # Login
GET    /api/auth/validate       # Validar token

GET    /api/users               # Listar utilizadores
POST   /api/users               # Criar utilizador
PUT    /api/users/:id           # Atualizar utilizador
DELETE /api/users/:id           # Eliminar utilizador

GET    /api/config              # Obter configurações
PUT    /api/config              # Atualizar configurações
GET    /api/config/test/:db     # Testar conexão
POST   /api/config/reload       # Recarregar configurações
```

## 🔒 Segurança

- Autenticação JWT com expiração
- Middleware de autorização
- Validação de entrada
- Headers de segurança
- Proteção CORS
- Sanitização de dados

## 📱 Interface

- Design responsivo
- Sidebar colapsível
- Componentes reutilizáveis
- Tema consistente
- Ícones Lucide React
- Tailwind CSS

## 🗄️ Base de Dados

### Configurações
- **Produção**: Manodi_Gesprod_v25.fdb
- **Gescom**: Manodi_v25.Fdb
- **Servidor**: telmo-hp/3052

### Tabelas Principais
- `TAB_UTILIZADORES`: Utilizadores do sistema

## 🌐 Deployment

### Domínio
- **Principal**: webserver.webolution.lan
- **Alias**: gesproducao.webolution.lan

### Estrutura
- Frontend servido pelo Apache
- Backend proxy para porta 3001
- Logs em `/var/log/apache2/`

## 📋 To-Do

- [ ] Implementar módulos de produção
- [ ] Sistema de notificações
- [ ] Relatórios dinâmicos
- [ ] Dashboard em tempo real
- [ ] Mobile app (futuro)
- [ ] API documentation
- [ ] Testes automatizados

## 🤝 Contribuição

1. Fork o projeto
2. Criar branch feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit mudanças (`git commit -m 'Adicionar nova funcionalidade'`)
4. Push para branch (`git push origin feature/NovaFuncionalidade`)
5. Abrir Pull Request

## 📄 Licença

Este projeto é propriedade privada e está protegido por direitos autorais.