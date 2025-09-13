# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend & Frontend (Both)
```bash
# Run both backend and frontend in development mode
npm run dev

# Build both backend and frontend for production
npm run build
```

### Backend Only
```bash
# Development server with auto-reload
npm run server:dev

# Build TypeScript to JavaScript
npm run server:build

# Run production server
npm start
```

### Frontend Only
```bash
# Development server (from client directory)
cd client && npm run dev

# Build for production (from client directory)
cd client && npm run build

# Lint frontend code (from client directory)
cd client && npm run lint
```

### Production Deployment
```bash
# Build and deploy with PM2
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Architecture Overview

This is a textile production management system ("Sistema de Gestão de Produção - Tinturaria e Estamparia") built with a Node.js backend and React frontend, designed for tablet interfaces in industrial environments.

### Tech Stack
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Database**: Firebird 2.5 (two databases: Producao and Gescom)
- **Authentication**: JWT with hybrid password validation (bcrypt + plaintext legacy)
- **Configuration**: INI files managed through web interface
- **Reports**: PDF generation using Puppeteer + Handlebars
- **Deployment**: Apache reverse proxy + PM2

### Project Structure
```
gesproducao_v2/
├── src/                    # Backend Node.js/Express
│   ├── controllers/        # API route handlers
│   ├── services/          # Business logic layer
│   ├── middleware/        # Express middlewares (auth, validation)
│   ├── routes/            # API route definitions
│   ├── config/            # Database connections, app config
│   └── types/             # TypeScript type definitions
├── client/                # Frontend React app
│   └── src/
│       ├── components/    # Reusable React components
│       ├── pages/         # Route page components
│       ├── contexts/      # React contexts (AuthContext)
│       ├── services/      # API client functions
│       └── types/         # Frontend TypeScript types
├── config.ini             # Database configuration file
└── ecosystem.config.js    # PM2 production configuration
```

### Key Architectural Patterns

#### Database Layer
- **DatabaseConnection**: Singleton class managing Firebird connections to two databases
- **Database Access**: Direct SQL queries using node-firebird, no ORM
- **Connection Management**: Automatic connection/disconnection per query
- **Configuration**: Dynamic database config through INI files with web editor

#### Authentication System
- **Hybrid Password Validation**: Supports both bcrypt hashed and legacy plaintext passwords
- **JWT Tokens**: Stateless authentication with user context
- **Role-Based Access**: Admin/Operator/Viewer roles with section-based permissions
- **User Context**: Available throughout app via AuthContext (seccao, isAdmin fields)

#### Configuration Management
- **ConfigManager**: Singleton for INI file operations with real-time reload
- **Web Editor**: Admin interface for editing INI files directly
- **Dynamic Reload**: Configuration changes applied without restart

#### Frontend Architecture
- **Protected Routes**: Role-based route protection with admin requirements
- **Layout System**: Collapsible sidebar with header navigation
- **API Integration**: Centralized API client with authentication headers
- **State Management**: React Context + React Query for server state

#### Report Generation
- **PDF Reports**: Puppeteer-based PDF generation with Handlebars templates
- **Customizable Templates**: Editable report templates through web interface
- **Print Integration**: Direct print functionality from web interface

### Important Business Rules

#### User Management
- Users have roles: admin, operator, viewer
- Users belong to sections (seccao field)
- Admin flag (administrador='S') grants configuration access
- Legacy authentication supports plaintext passwords for migration

#### Database Configuration
- **Producao Database**: Main production data (Manodi_Gesprod_v25.fdb)
- **Gescom Database**: Commercial data (Manodi_v25.Fdb)
- **Server**: telmo-hp/3052 (Firebird server:port format)
- **Connection Testing**: Built-in connection testing for both databases

#### Production Modules (In Development)
- **Tinturaria**: Reception, dyeing process, finishing, delivery
- **Laboratório**: Color registry, recipes, client tables, dyes/auxiliaries
- **Estamparia**: Reception, design tables, completed items
- **Sincronizações**: Data synchronization between systems

### Network Configuration

#### Development
- **Backend**: Runs on port 3003 (for remote access: 0.0.0.0:3003)
- **Frontend**: Runs on port 3002 (for remote access: 0.0.0.0:3002)
- **API Base URL**: http://192.168.1.91:3003 (update IP as needed)

#### Production
- **Domain**: webserver.webolution.lan / gesproducao.webolution.lan
- **Backend**: Port 3001 behind Apache reverse proxy
- **Frontend**: Served directly by Apache
- **SSL**: Apache handles HTTPS termination

### Security Considerations
- JWT tokens stored in localStorage with 'authToken' key
- CORS configured for specific origins
- Admin-only routes for configuration and user management
- Input validation on all API endpoints
- Helmet.js for security headers

### Development Notes
- Always run lint and typecheck commands if available before committing
- Use Firebird-specific SQL syntax (e.g., 'SELECT 1 FROM RDB$DATABASE' for connection tests)
- UI components follow consistent patterns with Lucide React icons
- Error handling uses standardized ApiResponse interface
- File uploads handled via multer middleware