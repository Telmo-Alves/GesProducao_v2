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
- [x] **Módulo Tinturaria Completo**
  - [x] Recepção de mercadoria (CRUD)
  - [x] Processo de tinturaria (CRUD com stored procedures)
  - [x] Entregas com cálculo automático de rolos
  - [x] Sistema leitor código barras para monitorização industrial
  - [x] Interface otimizada para dispositivos de parede
- [x] **Sistema de Relatórios**
  - [x] Geração PDF com Puppeteer + Handlebars
  - [x] Templates editáveis via interface web
  - [x] Relatórios de Recepções e Fichas de Acabamento

### 🚧 Em Desenvolvimento
- [ ] Módulo Laboratório
- [ ] Módulo Estamparia
- [ ] Sincronizações

## 🗂️ Módulos Planeados

### Tinturaria ✅ COMPLETO
- ✅ Recepção de mercadoria (CRUD completo)
- ✅ Processos (CRUD com stored procedures GRAVA_FA_PROCESSOS)
- ✅ Entregas (Registo com stored procedure GRAVA_MOV_ENTREGA)
- ✅ Operações (Sistema leitor código barras industrial)
  - Monitorização em tempo real do estado das máquinas
  - Integração com OBTER_MAQUINAS_STATUS e Insert_Maq_Leituras
  - Interface ultra-compacta para dispositivos de parede
  - Auto-focus para leitores código barras

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
# Autenticação
POST   /api/auth/login          # Login
GET    /api/auth/validate       # Validar token

# Utilizadores
GET    /api/users               # Listar utilizadores
POST   /api/users               # Criar utilizador
PUT    /api/users/:id           # Atualizar utilizador
DELETE /api/users/:id           # Eliminar utilizador

# Configurações
GET    /api/config              # Obter configurações
PUT    /api/config              # Atualizar configurações
GET    /api/config/test/:db     # Testar conexão
POST   /api/config/reload       # Recarregar configurações

# Tinturaria - Recepção
GET    /api/recepcao            # Listar recepções
POST   /api/recepcao            # Criar recepção
GET    /api/recepcao/:seccao/:data/:linha  # Obter recepção
PUT    /api/recepcao/:seccao/:data/:linha  # Atualizar recepção
DELETE /api/recepcao/:seccao/:data/:linha  # Eliminar recepção
POST   /api/recepcao/:seccao/:data/:linha/fechar  # Fechar recepção

# Fichas de Acabamento
GET    /api/fa                  # Listar fichas
POST   /api/fa                  # Criar ficha
GET    /api/fa/:seccao/:numero  # Obter ficha
PUT    /api/fa/:seccao/:numero  # Atualizar ficha
DELETE /api/fa/:seccao/:numero  # Eliminar ficha
POST   /api/fa/:seccao/:numero/fechar  # Fechar ficha

# Processos
GET    /api/processos/:fa_seccao/:fa_numero  # Listar processos FA
POST   /api/processos           # Criar processo (usa GRAVA_FA_PROCESSOS)
DELETE /api/processos/:fa_seccao/:fa_numero/:processo  # Remover processo

# Entregas
POST   /api/entregas            # Registar entrega (usa GRAVA_MOV_ENTREGA)

# Operações (SEM AUTENTICAÇÃO - dispositivo industrial)
GET    /api/operacoes/maquinas-status      # Estado das máquinas
POST   /api/operacoes/registar-leitura     # Registar leitura código barras
GET    /api/operacoes/test-connection      # Testar conexão BD

# Relatórios
GET    /api/reports/recepcoes/:seccao/:numero  # PDF Recepção
GET    /api/reports/fa/:seccao/:numero         # PDF Ficha Acabamento
GET    /api/reports/templates                  # Listar templates
POST   /api/reports/templates                 # Upload template
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