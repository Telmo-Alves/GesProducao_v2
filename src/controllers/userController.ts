import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { CreateUserRequest, UpdateUserRequest, ApiResponse, User } from '../types';

interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string; role: string };
}

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = async (req: AuthenticatedRequest, res: Response<ApiResponse<User[]>>) => {
    try {
      const users = await this.userService.getAllUsers();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Erro ao buscar utilizadores:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar utilizadores'
      });
    }
  };

  getUserById = async (req: AuthenticatedRequest, res: Response<ApiResponse<User>>) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Utilizador não encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Erro ao buscar utilizador:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar utilizador'
      });
    }
  };

  createUser = async (req: AuthenticatedRequest, res: Response<ApiResponse<User>>) => {
    try {
      const userData: CreateUserRequest = req.body;

      if (!userData.username || !userData.email || !userData.password || !userData.role) {
        return res.status(400).json({
          success: false,
          error: 'Todos os campos são obrigatórios'
        });
      }

      if (!['admin', 'operator', 'viewer'].includes(userData.role)) {
        return res.status(400).json({
          success: false,
          error: 'Papel inválido'
        });
      }

      const existingUser = await this.userService.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Username já existe'
        });
      }

      const user = await this.userService.createUser(userData);
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Erro ao criar utilizador:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar utilizador'
      });
    }
  };

  updateUser = async (req: AuthenticatedRequest, res: Response<ApiResponse<User>>) => {
    try {
      const { id } = req.params;
      const userData: UpdateUserRequest = req.body;

      if (userData.role && !['admin', 'operator', 'viewer'].includes(userData.role)) {
        return res.status(400).json({
          success: false,
          error: 'Papel inválido'
        });
      }

      const user = await this.userService.updateUser(id, userData);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Utilizador não encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar utilizador'
      });
    }
  };

  deleteUser = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    try {
      const { id } = req.params;
      
      if (req.user?.id === id) {
        return res.status(400).json({
          success: false,
          error: 'Não pode eliminar o seu próprio utilizador'
        });
      }

      const user = await this.userService.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Utilizador não encontrado'
        });
      }

      await this.userService.deleteUser(id);
      res.json({
        success: true,
        message: 'Utilizador eliminado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao eliminar utilizador:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao eliminar utilizador'
      });
    }
  };
}