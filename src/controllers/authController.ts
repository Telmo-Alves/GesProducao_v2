import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService';
import { LoginRequest, ApiResponse, LoginResponse } from '../types';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  login = async (req: Request<{}, ApiResponse<LoginResponse>, LoginRequest>, res: Response<ApiResponse<LoginResponse>>) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username e password são obrigatórios'
        });
      }

      const user = await this.userService.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }

      if (!user.active) {
        return res.status(401).json({
          success: false,
          error: 'Utilizador inativo'
        });
      }

      const isValidPassword = await this.userService.validatePassword(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }

      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          seccao: user.seccao,
          isAdmin: user.isAdmin
        },
        jwtSecret,
        { expiresIn: '8h' }
      );

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          token,
          user: userWithoutPassword
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  validateToken = async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token não fornecido'
        });
      }

      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
      
      jwt.verify(token, jwtSecret, async (err: any, decoded: any) => {
        if (err) {
          return res.status(403).json({
            success: false,
            error: 'Token inválido'
          });
        }

        const user = await this.userService.getUserById(decoded.id);
        
        if (!user || !user.active) {
          return res.status(401).json({
            success: false,
            error: 'Utilizador não encontrado ou inativo'
          });
        }

        res.json({
          success: true,
          data: { user }
        });
      });
    } catch (error) {
      console.error('Erro na validação do token:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };
}