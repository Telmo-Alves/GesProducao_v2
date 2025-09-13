import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../types';

interface AuthenticatedRequest extends Request {
  user?: User & { seccao: number; isAdmin: boolean };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token de acesso requerido' 
    });
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Token inválido' 
      });
    }
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