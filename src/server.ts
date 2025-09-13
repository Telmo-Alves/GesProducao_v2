import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import routes from './routes';
import { initializeDatabase } from './utils/database-init';
import { UserService } from './services/userService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());

// Middleware de log para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', routes);

// Servir arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado'
  });
});

async function startServer() {
  try {
    // Inicializar base de dados
    await initializeDatabase();
    
    // Inicializar utilizadores padrão
    const userService = new UserService();
    await userService.initializeDefaultUsers();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor executando na porta ${PORT}`);
      console.log(`📊 API disponível em:`);
      console.log(`   - http://localhost:${PORT}/api`);
      console.log(`   - http://192.168.1.91:${PORT}/api`);
      console.log(`   - http://webserver:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 CORS configurado para aceitar todas as origens`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();