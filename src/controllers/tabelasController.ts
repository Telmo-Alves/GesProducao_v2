import { Request, Response } from 'express';
import { TabelasService } from '../services/tabelasService';
import { ApiResponse } from '../types';
import {
  CreateClienteDto,
  UpdateClienteDto,
  CreateArtigoDto,
  UpdateArtigoDto,
  CreateComposicaoDto,
  UpdateComposicaoDto,
} from '../types/tabelas';

export class TabelasController {
  private service: TabelasService;

  constructor() {
    this.service = new TabelasService();
  }

  // Clientes
  listClientes = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const search = (req.query.search as string) || undefined;
      const result = await this.service.listClientes({ page, limit, search });
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({ success: false, error: 'Erro ao listar clientes' });
    }
  };

  getCliente = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const codigo = parseInt(req.params.codigo, 10);
      const data = await this.service.getCliente(codigo);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, error: 'Cliente não encontrado' });
    }
  };

  createCliente = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const dto: CreateClienteDto = req.body;
      if (typeof dto.codigo !== 'number' || !dto.nome) {
        return res.status(400).json({ success: false, error: 'Dados inválidos' });
      }
      const data = await this.service.createCliente(dto);
      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({ success: false, error: 'Erro ao criar cliente' });
    }
  };

  updateCliente = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const codigo = parseInt(req.params.codigo, 10);
      const dto: UpdateClienteDto = req.body;
      const data = await this.service.updateCliente(codigo, dto);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({ success: false, error: 'Erro ao atualizar cliente' });
    }
  };

  deleteCliente = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const codigo = parseInt(req.params.codigo, 10);
      await this.service.deleteCliente(codigo);
      res.json({ success: true, message: 'Cliente removido' });
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      res.status(500).json({ success: false, error: 'Erro ao remover cliente' });
    }
  };

  // Artigos
  listArtigos = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const search = (req.query.search as string) || undefined;
      const result = await this.service.listArtigos({ page, limit, search });
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro ao listar artigos:', error);
      res.status(500).json({ success: false, error: 'Erro ao listar artigos' });
    }
  };

  getArtigo = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const codigo = parseInt(req.params.codigo, 10);
      const data = await this.service.getArtigo(codigo);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, error: 'Artigo não encontrado' });
    }
  };

  createArtigo = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const dto: CreateArtigoDto = req.body;
      if (typeof dto.codigo !== 'number' || !dto.descricao) {
        return res.status(400).json({ success: false, error: 'Dados inválidos' });
      }
      const data = await this.service.createArtigo(dto);
      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('Erro ao criar artigo:', error);
      res.status(500).json({ success: false, error: 'Erro ao criar artigo' });
    }
  };

  updateArtigo = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const codigo = parseInt(req.params.codigo, 10);
      const dto: UpdateArtigoDto = req.body;
      const data = await this.service.updateArtigo(codigo, dto);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao atualizar artigo:', error);
      res.status(500).json({ success: false, error: 'Erro ao atualizar artigo' });
    }
  };

  deleteArtigo = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const codigo = parseInt(req.params.codigo, 10);
      await this.service.deleteArtigo(codigo);
      res.json({ success: true, message: 'Artigo removido' });
    } catch (error) {
      console.error('Erro ao remover artigo:', error);
      res.status(500).json({ success: false, error: 'Erro ao remover artigo' });
    }
  };

  // Composições
  listComposicoes = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const search = (req.query.search as string) || undefined;
      const result = await this.service.listComposicoes({ page, limit, search });
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro ao listar composições:', error);
      res.status(500).json({ success: false, error: 'Erro ao listar composições' });
    }
  };

  getComposicao = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const codigo = parseInt(req.params.codigo, 10);
      const data = await this.service.getComposicao(codigo);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, error: 'Composição não encontrada' });
    }
  };

  createComposicao = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const dto: CreateComposicaoDto = req.body;
      if (typeof dto.codigo !== 'number' || !dto.descricao) {
        return res.status(400).json({ success: false, error: 'Dados inválidos' });
      }
      const data = await this.service.createComposicao(dto);
      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('Erro ao criar composição:', error);
      res.status(500).json({ success: false, error: 'Erro ao criar composição' });
    }
  };

  updateComposicao = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const codigo = parseInt(req.params.codigo, 10);
      const dto: UpdateComposicaoDto = req.body;
      const data = await this.service.updateComposicao(codigo, dto);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao atualizar composição:', error);
      res.status(500).json({ success: false, error: 'Erro ao atualizar composição' });
    }
  };

  deleteComposicao = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const codigo = parseInt(req.params.codigo, 10);
      await this.service.deleteComposicao(codigo);
      res.json({ success: true, message: 'Composição removida' });
    } catch (error) {
      console.error('Erro ao remover composição:', error);
      res.status(500).json({ success: false, error: 'Erro ao remover composição' });
    }
  };
}
