import { Request, Response } from 'express';
import { RecepcaoService } from '../services/recepcaoService';
import { CreateMovRecepcaoRequest, UpdateMovRecepcaoRequest, MovRecepcaoFilters, ApiResponse } from '../types';

interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string; role: string; seccao: number; isAdmin: boolean };
}

export class RecepcaoController {
  private recepcaoService: RecepcaoService;

  constructor() {
    this.recepcaoService = new RecepcaoService();
  }

  createRecepcao = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const recepcaoData: CreateMovRecepcaoRequest = req.body;
      const utilizador = req.user?.username || 'SYSTEM';

      // Validações básicas
      if (!recepcaoData.seccao || !recepcaoData.data || !recepcaoData.cliente || 
          !recepcaoData.nome || !recepcaoData.codigo || !recepcaoData.descricao ||
          !recepcaoData.composicao || !recepcaoData.composicao_descricao) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios em falta'
        });
      }

      // Usar a secção do utilizador se não for admin
      if (!req.user?.isAdmin) {
        recepcaoData.seccao = req.user?.seccao || 1;
      }

      // Converter data se for string
      if (typeof recepcaoData.data === 'string') {
        recepcaoData.data = new Date(recepcaoData.data);
      }

      const recepcao = await this.recepcaoService.createRecepcao(recepcaoData, utilizador);

      res.status(201).json({
        success: true,
        data: recepcao
      });
    } catch (error) {
      console.error('Erro ao criar recepção:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar recepção'
      });
    }
  };

  getAllRecepcoes = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const filters: MovRecepcaoFilters = {
        seccao: req.query.seccao ? parseInt(req.query.seccao as string) : undefined,
        dataInicio: req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined,
        dataFim: req.query.dataFim ? new Date(req.query.dataFim as string) : undefined,
        cliente: req.query.cliente ? parseInt(req.query.cliente as string) : undefined,
        nome: req.query.nome as string,
        codigo: req.query.codigo ? parseInt(req.query.codigo as string) : undefined,
        composicao: req.query.composicao ? parseInt(req.query.composicao as string) : undefined,
        branquear: req.query.branquear as 'S' | 'N',
        desencolar: req.query.desencolar as 'S' | 'N',
        tingir: req.query.tingir as 'S' | 'N',
        utilizador: req.query.utilizador as string,
        requisicao: req.query.requisicao as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50
      };

      // Filtrar por secção se não for admin
      if (!req.user?.isAdmin) {
        filters.seccao = req.user?.seccao || 1;
      }

      const result = await this.recepcaoService.getAllRecepcoes(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao buscar recepções:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar recepções'
      });
    }
  };

  getRecepcaoById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { seccao, data, linha } = req.params;

      if (!seccao || !data || !linha) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros inválidos'
        });
      }

      const recepcaoData = new Date(data);
      const recepcao = await this.recepcaoService.getRecepcaoById(
        parseInt(seccao), 
        recepcaoData, 
        parseInt(linha)
      );

      // Verificar permissões de secção
      if (!req.user?.isAdmin && recepcao.seccao !== req.user?.seccao) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão para aceder a esta secção'
        });
      }

      res.json({
        success: true,
        data: recepcao
      });
    } catch (error: any) {
      console.error('Erro ao buscar recepção:', error);
      if (error.message === 'Registro de recepção não encontrado') {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Erro ao buscar recepção'
        });
      }
    }
  };

  updateRecepcao = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { seccao, data, linha } = req.params;
      const updateData: UpdateMovRecepcaoRequest = req.body;

      if (!seccao || !data || !linha) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros inválidos'
        });
      }

      const seccaoNum = parseInt(seccao);
      const recepcaoData = new Date(data);
      const linhaNum = parseInt(linha);

      // Verificar permissões de secção
      if (!req.user?.isAdmin && seccaoNum !== req.user?.seccao) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão para editar esta secção'
        });
      }

      // Converter datas se forem strings
      if (updateData.data && typeof updateData.data === 'string') {
        updateData.data = new Date(updateData.data);
      }

      const recepcao = await this.recepcaoService.updateRecepcao(
        seccaoNum, 
        recepcaoData, 
        linhaNum, 
        updateData
      );

      res.json({
        success: true,
        data: recepcao
      });
    } catch (error) {
      console.error('Erro ao atualizar recepção:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar recepção'
      });
    }
  };

  deleteRecepcao = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { seccao, data, linha } = req.params;

      if (!seccao || !data || !linha) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros inválidos'
        });
      }

      const seccaoNum = parseInt(seccao);
      const recepcaoData = new Date(data);
      const linhaNum = parseInt(linha);

      // Verificar permissões de secção
      if (!req.user?.isAdmin && seccaoNum !== req.user?.seccao) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão para eliminar desta secção'
        });
      }

      await this.recepcaoService.deleteRecepcao(seccaoNum, recepcaoData, linhaNum);

      res.json({
        success: true,
        message: 'Recepção eliminada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao eliminar recepção:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao eliminar recepção'
      });
    }
  };

  fecharRecepcao = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { seccao, data, linha } = req.params;

      if (!seccao || !data || !linha) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros inválidos'
        });
      }

      const seccaoNum = parseInt(seccao);
      const recepcaoData = new Date(data);
      const linhaNum = parseInt(linha);

      // Verificar permissões de secção
      if (!req.user?.isAdmin && seccaoNum !== req.user?.seccao) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão para fechar recepção desta secção'
        });
      }

      await this.recepcaoService.fecharRecepcao(seccaoNum, recepcaoData, linhaNum);

      res.json({
        success: true,
        message: 'Recepção fechada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fechar recepção:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao fechar recepção'
      });
    }
  };

  // Endpoints para dados de apoio
  getClientes = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clientes = await this.recepcaoService.getClientes();
      res.json({
        success: true,
        data: clientes
      });
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar clientes'
      });
    }
  };

  getArtigos = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const artigos = await this.recepcaoService.getArtigos();
      res.json({
        success: true,
        data: artigos
      });
    } catch (error) {
      console.error('Erro ao buscar artigos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar artigos'
      });
    }
  };

  getComposicoes = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const composicoes = await this.recepcaoService.getComposicoes();
      res.json({
        success: true,
        data: composicoes
      });
    } catch (error) {
      console.error('Erro ao buscar composições:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar composições'
      });
    }
  };
}