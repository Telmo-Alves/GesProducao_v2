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

  // Auxiliares
  listAuxiliares = async (req: Request, res: Response<ApiResponse>) => {
    try { const page = req.query.page ? parseInt(req.query.page as string, 10) : 1; const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50; const search = (req.query.search as string) || undefined; const result = await this.service.listAuxiliares({ page, limit, search }); res.json({ success: true, data: result }); } catch (error) { console.error('Erro ao listar auxiliares:', error); res.status(500).json({ success: false, error: 'Erro ao listar auxiliares' }); }
  };
  getAuxiliar = async (req: Request, res: Response<ApiResponse>) => { try { const { auxiliar } = req.params; const data = await this.service.getAuxiliar(auxiliar); res.json({ success: true, data }); } catch { res.status(404).json({ success: false, error: 'Auxiliar não encontrado' }); } };
  createAuxiliar = async (req: Request, res: Response<ApiResponse>) => { try { const { auxiliar, descricao, situacao } = req.body as { auxiliar: string; descricao: string; situacao?: string }; if (!auxiliar || !descricao) return res.status(400).json({ success: false, error: 'Dados inválidos' }); const data = await this.service.createAuxiliar({ auxiliar, descricao, situacao }); res.status(201).json({ success: true, data }); } catch (error: any) { if (error?.message === 'AUXILIAR_JA_EXISTE') return res.status(409).json({ success: false, error: 'Já existe um auxiliar com esse código' }); console.error('Erro ao criar auxiliar:', error); res.status(500).json({ success: false, error: 'Erro ao criar auxiliar' }); } };
  updateAuxiliar = async (req: Request, res: Response<ApiResponse>) => { try { const { auxiliar } = req.params; const { descricao, situacao } = req.body as { descricao?: string; situacao?: string }; const data = await this.service.updateAuxiliar(auxiliar, { descricao, situacao }); res.json({ success: true, data }); } catch (error) { console.error('Erro ao atualizar auxiliar:', error); res.status(500).json({ success: false, error: 'Erro ao atualizar auxiliar' }); } };
  deleteAuxiliar = async (req: Request, res: Response<ApiResponse>) => { try { const { auxiliar } = req.params; await this.service.deleteAuxiliar(auxiliar); res.json({ success: true, message: 'Auxiliar removido' }); } catch (error) { console.error('Erro ao remover auxiliar:', error); res.status(500).json({ success: false, error: 'Erro ao remover auxiliar' }); } };

  // Corantes
  listCorantes = async (req: Request, res: Response<ApiResponse>) => { try { const page = req.query.page ? parseInt(req.query.page as string, 10) : 1; const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50; const search = (req.query.search as string) || undefined; const result = await this.service.listCorantes({ page, limit, search }); res.json({ success: true, data: result }); } catch (error) { console.error('Erro ao listar corantes:', error); res.status(500).json({ success: false, error: 'Erro ao listar corantes' }); } };
  getCorante = async (req: Request, res: Response<ApiResponse>) => { try { const { corante } = req.params; const data = await this.service.getCorante(corante); res.json({ success: true, data }); } catch { res.status(404).json({ success: false, error: 'Corante não encontrado' }); } };
  createCorante = async (req: Request, res: Response<ApiResponse>) => { try { const { corante, descricao, ref_forn, situacao, classificacao } = req.body as any; if (!corante || !descricao) return res.status(400).json({ success: false, error: 'Dados inválidos' }); const data = await this.service.createCorante({ corante, descricao, ref_forn, situacao, classificacao }); res.status(201).json({ success: true, data }); } catch (error: any) { if (error?.message === 'CORANTE_JA_EXISTE') return res.status(409).json({ success: false, error: 'Já existe um corante com esse código' }); console.error('Erro ao criar corante:', error); res.status(500).json({ success: false, error: 'Erro ao criar corante' }); } };
  updateCorante = async (req: Request, res: Response<ApiResponse>) => { try { const { corante } = req.params; const { descricao, ref_forn, situacao, classificacao } = req.body as any; const data = await this.service.updateCorante(corante, { descricao, ref_forn, situacao, classificacao }); res.json({ success: true, data }); } catch (error) { console.error('Erro ao atualizar corante:', error); res.status(500).json({ success: false, error: 'Erro ao atualizar corante' }); } };
  deleteCorante = async (req: Request, res: Response<ApiResponse>) => { try { const { corante } = req.params; await this.service.deleteCorante(corante); res.json({ success: true, message: 'Corante removido' }); } catch (error) { console.error('Erro ao remover corante:', error); res.status(500).json({ success: false, error: 'Erro ao remover corante' }); } };

  // Cores
  listCores = async (req: Request, res: Response<ApiResponse>) => { try { const page = req.query.page ? parseInt(req.query.page as string, 10) : 1; const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50; const search = (req.query.search as string) || undefined; const result = await this.service.listCores({ page, limit, search }); res.json({ success: true, data: result }); } catch (error) { console.error('Erro ao listar cores:', error); res.status(500).json({ success: false, error: 'Erro ao listar cores' }); } };
  getCor = async (req: Request, res: Response<ApiResponse>) => { try { const id = parseInt(req.params.id, 10); const data = await this.service.getCor(id); res.json({ success: true, data }); } catch { res.status(404).json({ success: false, error: 'Cor não encontrada' }); } };
  createCor = async (req: Request, res: Response<ApiResponse>) => { try { const { id, codigo_cor, malha, pcusto, situacao, classificacao } = req.body as any; if (typeof id !== 'number' || !codigo_cor) return res.status(400).json({ success: false, error: 'Dados inválidos' }); const data = await this.service.createCor({ id, codigo_cor, malha, pcusto, situacao, classificacao }); res.status(201).json({ success: true, data }); } catch (error: any) { if (error?.message === 'COR_JA_EXISTE') return res.status(409).json({ success: false, error: 'Já existe uma cor com esse ID' }); console.error('Erro ao criar cor:', error); res.status(500).json({ success: false, error: 'Erro ao criar cor' }); } };
  updateCor = async (req: Request, res: Response<ApiResponse>) => { try { const id = parseInt(req.params.id, 10); const { codigo_cor, malha, pcusto, situacao, classificacao } = req.body as any; const data = await this.service.updateCor(id, { codigo_cor, malha, pcusto, situacao, classificacao }); res.json({ success: true, data }); } catch (error) { console.error('Erro ao atualizar cor:', error); res.status(500).json({ success: false, error: 'Erro ao atualizar cor' }); } };
  deleteCor = async (req: Request, res: Response<ApiResponse>) => { try { const id = parseInt(req.params.id, 10); await this.service.deleteCor(id); res.json({ success: true, message: 'Cor removida' }); } catch (error) { console.error('Erro ao remover cor:', error); res.status(500).json({ success: false, error: 'Erro ao remover cor' }); } };

  // Desenhos
  listDesenhos = async (req: Request, res: Response<ApiResponse>) => { try { const page = req.query.page ? parseInt(req.query.page as string, 10) : 1; const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50; const search = (req.query.search as string) || undefined; const result = await this.service.listDesenhos({ page, limit, search }); res.json({ success: true, data: result }); } catch (error) { console.error('Erro ao listar desenhos:', error); res.status(500).json({ success: false, error: 'Erro ao listar desenhos' }); } };
  getDesenho = async (req: Request, res: Response<ApiResponse>) => { try { const desenho = parseInt(req.params.desenho, 10); const data = await this.service.getDesenho(desenho); res.json({ success: true, data }); } catch { res.status(404).json({ success: false, error: 'Desenho não encontrado' }); } };
  createDesenho = async (req: Request, res: Response<ApiResponse>) => { try { const { desenho, descricao, cliente } = req.body as any; if (typeof desenho !== 'number' || !descricao) return res.status(400).json({ success: false, error: 'Dados inválidos' }); const data = await this.service.createDesenho({ desenho, descricao, cliente }); res.status(201).json({ success: true, data }); } catch (error: any) { if (error?.message === 'DESENHO_JA_EXISTE') return res.status(409).json({ success: false, error: 'Já existe um desenho com esse código' }); console.error('Erro ao criar desenho:', error); res.status(500).json({ success: false, error: 'Erro ao criar desenho' }); } };
  updateDesenho = async (req: Request, res: Response<ApiResponse>) => { try { const desenho = parseInt(req.params.desenho, 10); const { descricao, cliente } = req.body as any; const data = await this.service.updateDesenho(desenho, { descricao, cliente }); res.json({ success: true, data }); } catch (error) { console.error('Erro ao atualizar desenho:', error); res.status(500).json({ success: false, error: 'Erro ao atualizar desenho' }); } };
  deleteDesenho = async (req: Request, res: Response<ApiResponse>) => { try { const desenho = parseInt(req.params.desenho, 10); await this.service.deleteDesenho(desenho); res.json({ success: true, message: 'Desenho removido' }); } catch (error) { console.error('Erro ao remover desenho:', error); res.status(500).json({ success: false, error: 'Erro ao remover desenho' }); } };

  // Estados
  listEstados = async (req: Request, res: Response<ApiResponse>) => { try { const page = req.query.page ? parseInt(req.query.page as string, 10) : 1; const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50; const search = (req.query.search as string) || undefined; const result = await this.service.listEstados({ page, limit, search }); res.json({ success: true, data: result }); } catch (error) { console.error('Erro ao listar estados:', error); res.status(500).json({ success: false, error: 'Erro ao listar estados' }); } };
  getEstado = async (req: Request, res: Response<ApiResponse>) => { try { const id = parseInt(req.params.id, 10); const data = await this.service.getEstado(id); res.json({ success: true, data }); } catch { res.status(404).json({ success: false, error: 'Estado não encontrado' }); } };
  createEstado = async (req: Request, res: Response<ApiResponse>) => { try { const { id, descricao, movimenta, situacao } = req.body as any; if (typeof id !== 'number' || !descricao) return res.status(400).json({ success: false, error: 'Dados inválidos' }); const data = await this.service.createEstado({ id, descricao, movimenta, situacao }); res.status(201).json({ success: true, data }); } catch (error: any) { if (error?.message === 'ESTADO_JA_EXISTE') return res.status(409).json({ success: false, error: 'Já existe um estado com esse ID' }); console.error('Erro ao criar estado:', error); res.status(500).json({ success: false, error: 'Erro ao criar estado' }); } };
  updateEstado = async (req: Request, res: Response<ApiResponse>) => { try { const id = parseInt(req.params.id, 10); const { descricao, movimenta, situacao } = req.body as any; const data = await this.service.updateEstado(id, { descricao, movimenta, situacao }); res.json({ success: true, data }); } catch (error) { console.error('Erro ao atualizar estado:', error); res.status(500).json({ success: false, error: 'Erro ao atualizar estado' }); } };
  deleteEstado = async (req: Request, res: Response<ApiResponse>) => { try { const id = parseInt(req.params.id, 10); await this.service.deleteEstado(id); res.json({ success: true, message: 'Estado removido' }); } catch (error) { console.error('Erro ao remover estado:', error); res.status(500).json({ success: false, error: 'Erro ao remover estado' }); } };

  // Maquinas
  listMaquinas = async (req: Request, res: Response<ApiResponse>) => { try { const page = req.query.page ? parseInt(req.query.page as string, 10) : 1; const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50; const search = (req.query.search as string) || undefined; const result = await this.service.listMaquinas({ page, limit, search }); res.json({ success: true, data: result }); } catch (error) { console.error('Erro ao listar máquinas:', error); res.status(500).json({ success: false, error: 'Erro ao listar máquinas' }); } };
  getMaquina = async (req: Request, res: Response<ApiResponse>) => { try { const maquina = parseInt(req.params.maquina, 10); const data = await this.service.getMaquina(maquina); res.json({ success: true, data }); } catch { res.status(404).json({ success: false, error: 'Máquina não encontrada' }); } };
  createMaquina = async (req: Request, res: Response<ApiResponse>) => { try { const { maquina, descricao, observacoes, situacao, seccao, ordem } = req.body as any; if (typeof maquina !== 'number' || !descricao) return res.status(400).json({ success: false, error: 'Dados inválidos' }); const data = await this.service.createMaquina({ maquina, descricao, observacoes, situacao, seccao, ordem }); res.status(201).json({ success: true, data }); } catch (error: any) { if (error?.message === 'MAQUINA_JA_EXISTE') return res.status(409).json({ success: false, error: 'Já existe uma máquina com esse código' }); console.error('Erro ao criar máquina:', error); res.status(500).json({ success: false, error: 'Erro ao criar máquina' }); } };
  updateMaquina = async (req: Request, res: Response<ApiResponse>) => { try { const maquina = parseInt(req.params.maquina, 10); const { descricao, observacoes, situacao, seccao, ordem } = req.body as any; const data = await this.service.updateMaquina(maquina, { descricao, observacoes, situacao, seccao, ordem }); res.json({ success: true, data }); } catch (error) { console.error('Erro ao atualizar máquina:', error); res.status(500).json({ success: false, error: 'Erro ao atualizar máquina' }); } };
  deleteMaquina = async (req: Request, res: Response<ApiResponse>) => { try { const maquina = parseInt(req.params.maquina, 10); await this.service.deleteMaquina(maquina); res.json({ success: true, message: 'Máquina removida' }); } catch (error) { console.error('Erro ao remover máquina:', error); res.status(500).json({ success: false, error: 'Erro ao remover máquina' }); } };

  // Operações
  listOperacoes = async (req: Request, res: Response<ApiResponse>) => { try { const page = req.query.page ? parseInt(req.query.page as string, 10) : 1; const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50; const search = (req.query.search as string) || undefined; const result = await this.service.listOperacoes({ page, limit, search }); res.json({ success: true, data: result }); } catch (error) { console.error('Erro ao listar operações:', error); res.status(500).json({ success: false, error: 'Erro ao listar operações' }); } };
  getOperacao = async (req: Request, res: Response<ApiResponse>) => { try { const operacao = parseInt(req.params.operacao, 10); const data = await this.service.getOperacao(operacao); res.json({ success: true, data }); } catch { res.status(404).json({ success: false, error: 'Operação não encontrada' }); } };
  createOperacao = async (req: Request, res: Response<ApiResponse>) => { try { const { operacao, descricao } = req.body as any; if (typeof operacao !== 'number' || !descricao) return res.status(400).json({ success: false, error: 'Dados inválidos' }); const data = await this.service.createOperacao({ operacao, descricao }); res.status(201).json({ success: true, data }); } catch (error: any) { if (error?.message === 'OPERACAO_JA_EXISTE') return res.status(409).json({ success: false, error: 'Já existe uma operação com esse código' }); console.error('Erro ao criar operação:', error); res.status(500).json({ success: false, error: 'Erro ao criar operação' }); } };
  updateOperacao = async (req: Request, res: Response<ApiResponse>) => { try { const operacao = parseInt(req.params.operacao, 10); const { descricao } = req.body as any; const data = await this.service.updateOperacao(operacao, { descricao }); res.json({ success: true, data }); } catch (error) { console.error('Erro ao atualizar operação:', error); res.status(500).json({ success: false, error: 'Erro ao atualizar operação' }); } };
  deleteOperacao = async (req: Request, res: Response<ApiResponse>) => { try { const operacao = parseInt(req.params.operacao, 10); await this.service.deleteOperacao(operacao); res.json({ success: true, message: 'Operação removida' }); } catch (error) { console.error('Erro ao remover operação:', error); res.status(500).json({ success: false, error: 'Erro ao remover operação' }); } };

  // Processos
  listProcessos = async (req: Request, res: Response<ApiResponse>) => { try { const page = req.query.page ? parseInt(req.query.page as string, 10) : 1; const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50; const search = (req.query.search as string) || undefined; const result = await this.service.listProcessos({ page, limit, search }); res.json({ success: true, data: result }); } catch (error) { console.error('Erro ao listar processos:', error); res.status(500).json({ success: false, error: 'Erro ao listar processos' }); } };
  getProcesso = async (req: Request, res: Response<ApiResponse>) => { try { const id = parseInt(req.params.id, 10); const data = await this.service.getProcesso(id); res.json({ success: true, data }); } catch { res.status(404).json({ success: false, error: 'Processo não encontrado' }); } };
  createProcesso = async (req: Request, res: Response<ApiResponse>) => { try { const { id, descricao, ordem, id_pai, situacao } = req.body as any; if (typeof id !== 'number' || !descricao) return res.status(400).json({ success: false, error: 'Dados inválidos' }); const data = await this.service.createProcesso({ id, descricao, ordem, id_pai, situacao }); res.status(201).json({ success: true, data }); } catch (error: any) { if (error?.message === 'PROCESSO_JA_EXISTE') return res.status(409).json({ success: false, error: 'Já existe um processo com esse ID' }); console.error('Erro ao criar processo:', error); res.status(500).json({ success: false, error: 'Erro ao criar processo' }); } };
  updateProcesso = async (req: Request, res: Response<ApiResponse>) => { try { const id = parseInt(req.params.id, 10); const { descricao, ordem, id_pai, situacao } = req.body as any; const data = await this.service.updateProcesso(id, { descricao, ordem, id_pai, situacao }); res.json({ success: true, data }); } catch (error) { console.error('Erro ao atualizar processo:', error); res.status(500).json({ success: false, error: 'Erro ao atualizar processo' }); } };
  deleteProcesso = async (req: Request, res: Response<ApiResponse>) => { try { const id = parseInt(req.params.id, 10); await this.service.deleteProcesso(id); res.json({ success: true, message: 'Processo removido' }); } catch (error) { console.error('Erro ao remover processo:', error); res.status(500).json({ success: false, error: 'Erro ao remover processo' }); } };

  // Terminais
  listTerminais = async (req: Request, res: Response<ApiResponse>) => { try { const page = req.query.page ? parseInt(req.query.page as string, 10) : 1; const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50; const search = (req.query.search as string) || undefined; const result = await this.service.listTerminais({ page, limit, search }); res.json({ success: true, data: result }); } catch (error) { console.error('Erro ao listar terminais:', error); res.status(500).json({ success: false, error: 'Erro ao listar terminais' }); } };
  getTerminal = async (req: Request, res: Response<ApiResponse>) => { try { const { terminal } = req.params; const data = await this.service.getTerminal(terminal); res.json({ success: true, data }); } catch { res.status(404).json({ success: false, error: 'Terminal não encontrado' }); } };
  createTerminal = async (req: Request, res: Response<ApiResponse>) => { try { const { terminal, maquina } = req.body as any; if (!terminal) return res.status(400).json({ success: false, error: 'Dados inválidos' }); const data = await this.service.createTerminal({ terminal, maquina }); res.status(201).json({ success: true, data }); } catch (error: any) { if (error?.message === 'TERMINAL_JA_EXISTE') return res.status(409).json({ success: false, error: 'Já existe um terminal com esse código' }); console.error('Erro ao criar terminal:', error); res.status(500).json({ success: false, error: 'Erro ao criar terminal' }); } };
  updateTerminal = async (req: Request, res: Response<ApiResponse>) => { try { const { terminal } = req.params; const { maquina } = req.body as any; const data = await this.service.updateTerminal(terminal, { maquina }); res.json({ success: true, data }); } catch (error) { console.error('Erro ao atualizar terminal:', error); res.status(500).json({ success: false, error: 'Erro ao atualizar terminal' }); } };
  deleteTerminal = async (req: Request, res: Response<ApiResponse>) => { try { const { terminal } = req.params; await this.service.deleteTerminal(terminal); res.json({ success: true, message: 'Terminal removido' }); } catch (error) { console.error('Erro ao remover terminal:', error); res.status(500).json({ success: false, error: 'Erro ao remover terminal' }); } };

  // Utilizadores
  listUtilizadores = async (req: Request, res: Response<ApiResponse>) => { try { const page = req.query.page ? parseInt(req.query.page as string, 10) : 1; const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50; const search = (req.query.search as string) || undefined; const result = await this.service.listUtilizadores({ page, limit, search }); res.json({ success: true, data: result }); } catch (error) { console.error('Erro ao listar utilizadores:', error); res.status(500).json({ success: false, error: 'Erro ao listar utilizadores' }); } };
  getUtilizador = async (req: Request, res: Response<ApiResponse>) => { try { const { utilizador } = req.params; const data = await this.service.getUtilizador(utilizador); res.json({ success: true, data }); } catch { res.status(404).json({ success: false, error: 'Utilizador não encontrado' }); } };
  createUtilizador = async (req: Request, res: Response<ApiResponse>) => { try { const { utilizador, senha, nivel, seccao, administrador } = req.body as any; if (!utilizador || !senha) return res.status(400).json({ success: false, error: 'Dados inválidos' }); const data = await this.service.createUtilizador({ utilizador, senha, nivel, seccao, administrador }); res.status(201).json({ success: true, data }); } catch (error: any) { if (error?.message === 'UTILIZADOR_JA_EXISTE') return res.status(409).json({ success: false, error: 'Já existe um utilizador com esse código' }); console.error('Erro ao criar utilizador:', error); res.status(500).json({ success: false, error: 'Erro ao criar utilizador' }); } };
  updateUtilizador = async (req: Request, res: Response<ApiResponse>) => { try { const { utilizador } = req.params; const { senha, nivel, seccao, administrador } = req.body as any; const data = await this.service.updateUtilizador(utilizador, { senha, nivel, seccao, administrador }); res.json({ success: true, data }); } catch (error) { console.error('Erro ao atualizar utilizador:', error); res.status(500).json({ success: false, error: 'Erro ao atualizar utilizador' }); } };
  deleteUtilizador = async (req: Request, res: Response<ApiResponse>) => { try { const { utilizador } = req.params; await this.service.deleteUtilizador(utilizador); res.json({ success: true, message: 'Utilizador removido' }); } catch (error) { console.error('Erro ao remover utilizador:', error); res.status(500).json({ success: false, error: 'Erro ao remover utilizador' }); } };
}
