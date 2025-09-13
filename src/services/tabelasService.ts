import { DatabaseConnection } from '../config/database';
import { ConfigManager } from '../config/config';
import {
  PagedResult,
  ClienteOption,
  ArtigoOption,
  ComposicaoOption,
  CreateClienteDto,
  UpdateClienteDto,
  CreateArtigoDto,
  UpdateArtigoDto,
  CreateComposicaoDto,
  UpdateComposicaoDto,
  ListFilters,
} from '../types/tabelas';

export class TabelasService {
  private dbConnection: DatabaseConnection;

  constructor() {
    const config = ConfigManager.getInstance().getConfig();
    this.dbConnection = DatabaseConnection.getInstance(config);
  }

  // Clientes
  async listClientes(filters: ListFilters = {}): Promise<PagedResult<ClienteOption>> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 50;
    const offset = (page - 1) * limit;
    const params: any[] = [];

    let where = " WHERE 1=1 AND COALESCE(SITUACAO, 'ACT') = 'ACT'";
    if (filters.search) {
      where += ' AND (UPPER(NOME) CONTAINING ? OR CAST(CLIENTE AS VARCHAR(20)) LIKE ?)';
      params.push(filters.search.toUpperCase(), `%${filters.search}%`);
    }

    const countQuery = `SELECT COUNT(*) AS TOTAL FROM TAB_CLIENTES ${where}`;
    const countRes = await this.dbConnection.executeQuery('producao', countQuery, params);
    const total = countRes[0]?.TOTAL || 0;

    const dataQuery = `
      SELECT FIRST ${limit} SKIP ${offset} CLIENTE as CODIGO, NOME, CONTACTOS
      FROM TAB_CLIENTES
      ${where}
      ORDER BY NOME
    `;
    const rows = await this.dbConnection.executeQuery('producao', dataQuery, params);
    const data: ClienteOption[] = rows.map((r: any) => ({ codigo: r.CODIGO, nome: (r.NOME || '').trim(), contactos: (r.CONTACTOS || '').trim() }));
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getCliente(codigo: number): Promise<ClienteOption> {
    const query = 'SELECT CLIENTE as CODIGO, NOME, CONTACTOS FROM TAB_CLIENTES WHERE CLIENTE = ?';
    const rows = await this.dbConnection.executeQuery('producao', query, [codigo]);
    if (!rows.length) throw new Error('Cliente não encontrado');
    return { codigo: rows[0].CODIGO, nome: (rows[0].NOME || '').trim(), contactos: (rows[0].CONTACTOS || '').trim() };
  }

  async createCliente(dto: CreateClienteDto): Promise<ClienteOption> {
    const insert = 'INSERT INTO TAB_CLIENTES (CLIENTE, NOME, CONTACTOS, SITUACAO) VALUES (?, ?, ?, COALESCE(?, \"ACT\"))';
    await this.dbConnection.executeQuery('producao', insert, [dto.codigo, dto.nome, dto.contactos || '', 'ACT']);
    return this.getCliente(dto.codigo);
  }

  async updateCliente(codigo: number, dto: UpdateClienteDto): Promise<ClienteOption> {
    const fields: string[] = [];
    const params: any[] = [];
    if (dto.nome !== undefined) { fields.push('NOME = ?'); params.push(dto.nome); }
    if (dto.contactos !== undefined) { fields.push('CONTACTOS = ?'); params.push(dto.contactos); }
    if (!fields.length) throw new Error('Nenhum campo para atualizar');
    params.push(codigo);
    const update = `UPDATE TAB_CLIENTES SET ${fields.join(', ')} WHERE CLIENTE = ?`;
    await this.dbConnection.executeQuery('producao', update, params);
    return this.getCliente(codigo);
  }

  async deleteCliente(codigo: number): Promise<boolean> {
    const del = 'DELETE FROM TAB_CLIENTES WHERE CLIENTE = ?';
    await this.dbConnection.executeQuery('producao', del, [codigo]);
    return true;
  }

  // Artigos
  async listArtigos(filters: ListFilters = {}): Promise<PagedResult<ArtigoOption>> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 50;
    const offset = (page - 1) * limit;
    const params: any[] = [];

    let where = " WHERE 1=1 AND COALESCE(SITUACAO, 'ACT') = 'ACT'";
    if (filters.search) {
      where += ' AND (UPPER(DESCRICAO) CONTAINING ? OR CAST(CODIGO AS VARCHAR(20)) LIKE ?)';
      params.push(filters.search.toUpperCase(), `%${filters.search}%`);
    }

    const countQuery = `SELECT COUNT(*) AS TOTAL FROM TAB_ARTIGOS ${where}`;
    const countRes = await this.dbConnection.executeQuery('producao', countQuery, params);
    const total = countRes[0]?.TOTAL || 0;

    const dataQuery = `
      SELECT FIRST ${limit} SKIP ${offset} CODIGO, DESCRICAO, UN_MEDIDA, SITUACAO, SECCAO
      FROM TAB_ARTIGOS
      ${where}
      ORDER BY DESCRICAO
    `;
    const rows = await this.dbConnection.executeQuery('producao', dataQuery, params);
    const data: ArtigoOption[] = rows.map((r: any) => ({
      codigo: r.CODIGO,
      descricao: (r.DESCRICAO || '').trim(),
      un_medida: (r.UN_MEDIDA || '').trim(),
      situacao: (r.SITUACAO || '').trim(),
      seccao: r.SECCAO,
    }));
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getArtigo(codigo: number): Promise<ArtigoOption> {
    const query = 'SELECT CODIGO, DESCRICAO, UN_MEDIDA, SITUACAO, SECCAO FROM TAB_ARTIGOS WHERE CODIGO = ?';
    const rows = await this.dbConnection.executeQuery('producao', query, [codigo]);
    if (!rows.length) throw new Error('Artigo não encontrado');
    return {
      codigo: rows[0].CODIGO,
      descricao: (rows[0].DESCRICAO || '').trim(),
      un_medida: (rows[0].UN_MEDIDA || '').trim(),
      situacao: (rows[0].SITUACAO || '').trim(),
      seccao: rows[0].SECCAO,
    };
    }

  async createArtigo(dto: CreateArtigoDto): Promise<ArtigoOption> {
    const insert = 'INSERT INTO TAB_ARTIGOS (CODIGO, DESCRICAO, UN_MEDIDA, SITUACAO, SECCAO) VALUES (?, ?, ?, COALESCE(?, \"ACT\"), COALESCE(?, 1))';
    await this.dbConnection.executeQuery('producao', insert, [dto.codigo, dto.descricao, dto.un_medida || 'KG', dto.situacao || 'ACT', dto.seccao || 1]);
    return this.getArtigo(dto.codigo);
  }

  async updateArtigo(codigo: number, dto: UpdateArtigoDto): Promise<ArtigoOption> {
    const fields: string[] = [];
    const params: any[] = [];
    if (dto.descricao !== undefined) { fields.push('DESCRICAO = ?'); params.push(dto.descricao); }
    if (dto.un_medida !== undefined) { fields.push('UN_MEDIDA = ?'); params.push(dto.un_medida); }
    if (dto.situacao !== undefined) { fields.push('SITUACAO = ?'); params.push(dto.situacao); }
    if (dto.seccao !== undefined) { fields.push('SECCAO = ?'); params.push(dto.seccao); }
    if (!fields.length) throw new Error('Nenhum campo para atualizar');
    params.push(codigo);
    const update = `UPDATE TAB_ARTIGOS SET ${fields.join(', ')} WHERE CODIGO = ?`;
    await this.dbConnection.executeQuery('producao', update, params);
    return this.getArtigo(codigo);
  }

  async deleteArtigo(codigo: number): Promise<boolean> {
    const del = 'DELETE FROM TAB_ARTIGOS WHERE CODIGO = ?';
    await this.dbConnection.executeQuery('producao', del, [codigo]);
    return true;
  }

  // Composições
  async listComposicoes(filters: ListFilters = {}): Promise<PagedResult<ComposicaoOption>> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 50;
    const offset = (page - 1) * limit;
    const params: any[] = [];

    let where = " WHERE 1=1 AND COALESCE(SITUACAO, 'ACT') = 'ACT'";
    if (filters.search) {
      where += ' AND (UPPER(DESCRICAO) CONTAINING ? OR CAST(COMPOSICAO AS VARCHAR(20)) LIKE ?)';
      params.push(filters.search.toUpperCase(), `%${filters.search}%`);
    }

    const countQuery = `SELECT COUNT(*) AS TOTAL FROM TAB_COMPOSICOES ${where}`;
    const countRes = await this.dbConnection.executeQuery('producao', countQuery, params);
    const total = countRes[0]?.TOTAL || 0;

    const dataQuery = `
      SELECT FIRST ${limit} SKIP ${offset} COMPOSICAO as CODIGO, DESCRICAO
      FROM TAB_COMPOSICOES
      ${where}
      ORDER BY DESCRICAO
    `;
    const rows = await this.dbConnection.executeQuery('producao', dataQuery, params);
    const data: ComposicaoOption[] = rows.map((r: any) => ({ codigo: r.CODIGO, descricao: (r.DESCRICAO || '').trim() }));
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getComposicao(codigo: number): Promise<ComposicaoOption> {
    const query = 'SELECT COMPOSICAO as CODIGO, DESCRICAO FROM TAB_COMPOSICOES WHERE COMPOSICAO = ?';
    const rows = await this.dbConnection.executeQuery('producao', query, [codigo]);
    if (!rows.length) throw new Error('Composição não encontrada');
    return { codigo: rows[0].CODIGO, descricao: (rows[0].DESCRICAO || '').trim() };
  }

  async createComposicao(dto: CreateComposicaoDto): Promise<ComposicaoOption> {
    const insert = 'INSERT INTO TAB_COMPOSICOES (COMPOSICAO, DESCRICAO, SITUACAO) VALUES (?, ?, COALESCE(?, \"ACT\"))';
    await this.dbConnection.executeQuery('producao', insert, [dto.codigo, dto.descricao, 'ACT']);
    return this.getComposicao(dto.codigo);
  }

  async updateComposicao(codigo: number, dto: UpdateComposicaoDto): Promise<ComposicaoOption> {
    const fields: string[] = [];
    const params: any[] = [];
    if (dto.descricao !== undefined) { fields.push('DESCRICAO = ?'); params.push(dto.descricao); }
    if (!fields.length) throw new Error('Nenhum campo para atualizar');
    params.push(codigo);
    const update = `UPDATE TAB_COMPOSICOES SET ${fields.join(', ')} WHERE COMPOSICAO = ?`;
    await this.dbConnection.executeQuery('producao', update, params);
    return this.getComposicao(codigo);
  }

  async deleteComposicao(codigo: number): Promise<boolean> {
    const del = 'DELETE FROM TAB_COMPOSICOES WHERE COMPOSICAO = ?';
    await this.dbConnection.executeQuery('producao', del, [codigo]);
    return true;
  }
}
