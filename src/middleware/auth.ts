import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../types';

interface AuthenticatedRequest extends Request {
  user?: User & { seccao: number; isAdmin: boolean };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('authenticateToken - Headers:', req.headers);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('authenticateToken - Token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('authenticateToken - No token provided');
    return res.status(401).json({
      success: false,
      error: 'Token de acesso requerido'
    });
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
  console.log('authenticateToken - Using JWT Secret:', jwtSecret.substring(0, 10) + '...');

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) {
      console.error('authenticateToken - JWT Verify Error:', err);
      return res.status(403).json({
        success: false,
        error: 'Token inválido'
      });
    }
    console.log('authenticateToken - User from token:', user);
    req.user = user;
    next();
  });
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Utilizador não autenticado' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acesso negado: permissões insuficientes' 
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);