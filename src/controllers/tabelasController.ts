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
    } catch (error: any) {
      if (error?.message === 'CLIENTE_JA_EXISTE') {
        return res.status(409).json({ success: false, error: 'Já existe um cliente com esse código' });
      }
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
    } catch (error: any) {
      if (error?.message === 'ARTIGO_JA_EXISTE') {
        return res.status(409).json({ success: false, error: 'Já existe um artigo com esse código' });
      }
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
    } catch (error: any) {
      if (error?.message === 'COMPOSICAO_JA_EXISTE') {
        return res.status(409).json({ success: false, error: 'Já existe uma composição com esse código' });
      }
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

  // Unidades de Medida
  listUnidades = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const search = (req.query.search as string) || undefined;
      const result = await this.service.listUnidades({ page, limit, search });
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro ao listar unidades:', error);
      res.status(500).json({ success: false, error: 'Erro ao listar unidades' });
    }
  };

  getUnidade = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const { un_medida } = req.params;
      const data = await this.service.getUnidade(un_medida);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, error: 'Unidade não encontrada' });
    }
  };

  createUnidade = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const { un_medida, descricao, medida } = req.body as { un_medida: string; descricao: string; medida?: number };
      if (!un_medida || !descricao) {
        return res.status(400).json({ success: false, error: 'Dados inválidos' });
      }
      const data = await this.service.createUnidade({ un_medida, descricao, medida });
      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('Erro ao criar unidade:', error);
      res.status(500).json({ success: false, error: 'Erro ao criar unidade' });
    }
  };

  updateUnidade = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const { un_medida } = req.params;
      const { descricao, medida } = req.body as { descricao?: string; medida?: number };
      const data = await this.service.updateUnidade(un_medida, { descricao, medida });
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
      res.status(500).json({ success: false, error: 'Erro ao atualizar unidade' });
    }
  };

  deleteUnidade = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const { un_medida } = req.params;
      await this.service.deleteUnidade(un_medida);
      res.json({ success: true, message: 'Unidade removida' });
    } catch (error) {
      console.error('Erro ao remover unidade:', error);
      res.status(500).json({ success: false, error: 'Erro ao remover unidade' });
    }
  };

  // Secções
  listSeccoes = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const search = (req.query.search as string) || undefined;
      const result = await this.service.listSeccoes({ page, limit, search });
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro ao listar secções:', error);
      res.status(500).json({ success: false, error: 'Erro ao listar secções' });
    }
  };

  getSeccao = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const seccao = parseInt(req.params.seccao, 10);
      const data = await this.service.getSeccao(seccao);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, error: 'Secção não encontrada' });
    }
  };

  createSeccao = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const { seccao, descricao, ordem, situacao } = req.body as { seccao: number; descricao: string; ordem?: number; situacao?: string };
      if (typeof seccao !== 'number' || !descricao) {
        return res.status(400).json({ success: false, error: 'Dados inválidos' });
      }
      const data = await this.service.createSeccao({ seccao, descricao, ordem, situacao });
      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('Erro ao criar secção:', error);
      res.status(500).json({ success: false, error: 'Erro ao criar secção' });
    }
  };

  updateSeccao = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const seccao = parseInt(req.params.seccao, 10);
      const { descricao, ordem, situacao } = req.body as { descricao?: string; ordem?: number; situacao?: string };
      const data = await this.service.updateSeccao(seccao, { descricao, ordem, situacao });
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao atualizar secção:', error);
      res.status(500).json({ success: false, error: 'Erro ao atualizar secção' });
    }
  };

  deleteSeccao = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const seccao = parseInt(req.params.seccao, 10);
      await this.service.deleteSeccao(seccao);
      res.json({ success: true, message: 'Secção removida' });
    } catch (error) {
      console.error('Erro ao remover secção:', error);
      res.status(500).json({ success: false, error: 'Erro ao remover secção' });
    }
  };
}
