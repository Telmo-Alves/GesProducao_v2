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
      where += ' AND (UPPER(NOME) CONTAINING ? OR UPPER(CONTACTOS) CONTAINING ? OR CAST(CLIENTE AS VARCHAR(20)) LIKE ?)';
      params.push(filters.search.toUpperCase(), filters.search.toUpperCase(), `%${filters.search}%`);
    }

    const countQuery = `SELECT COUNT(*) AS TOTAL FROM TAB_CLIENTES ${where}`;
    const countRes = await this.dbConnection.executeQuery('producao', countQuery, params);
    const total = countRes[0]?.TOTAL || 0;

    const dataQuery = `
      SELECT FIRST ${limit} SKIP ${offset} CLIENTE as CODIGO, NOME, CONTACTOS, SITUACAO
      FROM TAB_CLIENTES
      ${where}
      ORDER BY NOME
    `;
    const rows = await this.dbConnection.executeQuery('producao', dataQuery, params);
    const data: ClienteOption[] = rows.map((r: any) => ({
      codigo: r.CODIGO,
      nome: (r.NOME || '').trim(),
      contactos: (r.CONTACTOS || '').trim(),
      situacao: (r.SITUACAO || '').trim(),
    }));
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getCliente(codigo: number): Promise<ClienteOption> {
    const query = 'SELECT CLIENTE as CODIGO, NOME, CONTACTOS, SITUACAO FROM TAB_CLIENTES WHERE CLIENTE = ?';
    const rows = await this.dbConnection.executeQuery('producao', query, [codigo]);
    if (!rows.length) throw new Error('Cliente não encontrado');
    return {
      codigo: rows[0].CODIGO,
      nome: (rows[0].NOME || '').trim(),
      contactos: (rows[0].CONTACTOS || '').trim(),
      situacao: (rows[0].SITUACAO || '').trim(),
    };
  }

  async createCliente(dto: CreateClienteDto): Promise<ClienteOption> {
    // Verificar duplicado
    const existsQuery = 'SELECT 1 AS X FROM TAB_CLIENTES WHERE CLIENTE = ? ROWS 1';
    const exists = await this.dbConnection.executeQuery('producao', existsQuery, [dto.codigo]);
    if (exists.length > 0) {
      const err = new Error('CLIENTE_JA_EXISTE');
      throw err;
    }

    const insert = 'INSERT INTO TAB_CLIENTES (CLIENTE, NOME, CONTACTOS, SITUACAO) VALUES (?, ?, ?, COALESCE(?, \"ACT\"))';
    await this.dbConnection.executeQuery('producao', insert, [dto.codigo, dto.nome, dto.contactos || '', dto.situacao || 'ACT']);
    return this.getCliente(dto.codigo);
  }

  async updateCliente(codigo: number, dto: UpdateClienteDto): Promise<ClienteOption> {
    const fields: string[] = [];
    const params: any[] = [];
    if (dto.nome !== undefined) { fields.push('NOME = ?'); params.push(dto.nome); }
    if (dto.contactos !== undefined) { fields.push('CONTACTOS = ?'); params.push(dto.contactos); }
    if (dto.situacao !== undefined) { fields.push('SITUACAO = ?'); params.push(dto.situacao); }
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
    // Verificar duplicado
    const existsQuery = 'SELECT 1 AS X FROM TAB_ARTIGOS WHERE CODIGO = ? ROWS 1';
    const exists = await this.dbConnection.executeQuery('producao', existsQuery, [dto.codigo]);
    if (exists.length > 0) {
      throw new Error('ARTIGO_JA_EXISTE');
    }

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
      SELECT FIRST ${limit} SKIP ${offset} COMPOSICAO as CODIGO, DESCRICAO, SITUACAO
      FROM TAB_COMPOSICOES
      ${where}
      ORDER BY DESCRICAO
    `;
    const rows = await this.dbConnection.executeQuery('producao', dataQuery, params);
    const data: ComposicaoOption[] = rows.map((r: any) => ({ codigo: r.CODIGO, descricao: (r.DESCRICAO || '').trim(), situacao: (r.SITUACAO || '').trim() }));
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getComposicao(codigo: number): Promise<ComposicaoOption> {
    const query = 'SELECT COMPOSICAO as CODIGO, DESCRICAO, SITUACAO FROM TAB_COMPOSICOES WHERE COMPOSICAO = ?';
    const rows = await this.dbConnection.executeQuery('producao', query, [codigo]);
    if (!rows.length) throw new Error('Composição não encontrada');
    return { codigo: rows[0].CODIGO, descricao: (rows[0].DESCRICAO || '').trim(), situacao: (rows[0].SITUACAO || '').trim() };
  }

  async createComposicao(dto: CreateComposicaoDto): Promise<ComposicaoOption> {
    // Verificar duplicado
    const existsQuery = 'SELECT 1 AS X FROM TAB_COMPOSICOES WHERE COMPOSICAO = ? ROWS 1';
    const exists = await this.dbConnection.executeQuery('producao', existsQuery, [dto.codigo]);
    if (exists.length > 0) {
      throw new Error('COMPOSICAO_JA_EXISTE');
    }

    const insert = 'INSERT INTO TAB_COMPOSICOES (COMPOSICAO, DESCRICAO, SITUACAO) VALUES (?, ?, COALESCE(?, \"ACT\"))';
    await this.dbConnection.executeQuery('producao', insert, [dto.codigo, dto.descricao, dto.situacao || 'ACT']);
    return this.getComposicao(dto.codigo);
  }

  async updateComposicao(codigo: number, dto: UpdateComposicaoDto): Promise<ComposicaoOption> {
    const fields: string[] = [];
    const params: any[] = [];
    if (dto.descricao !== undefined) { fields.push('DESCRICAO = ?'); params.push(dto.descricao); }
    if (dto.situacao !== undefined) { fields.push('SITUACAO = ?'); params.push(dto.situacao); }
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

  // Unidades de Medida (UN_MEDIDAS)
  async listUnidades(filters: ListFilters = {}): Promise<PagedResult<{ un_medida: string; descricao: string; medida?: number }>> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 50;
    const offset = (page - 1) * limit;
    const params: any[] = [];

    let where = ' WHERE 1=1';
    if (filters.search) {
      where += ' AND (UPPER(DESCRICAO) CONTAINING ? OR UPPER(UN_MEDIDA) CONTAINING ?)';
      params.push(filters.search.toUpperCase(), filters.search.toUpperCase());
    }

    const countQuery = `SELECT COUNT(*) AS TOTAL FROM UN_MEDIDAS ${where}`;
    const countRes = await this.dbConnection.executeQuery('producao', countQuery, params);
    const total = countRes[0]?.TOTAL || 0;

    const dataQuery = `
      SELECT FIRST ${limit} SKIP ${offset} UN_MEDIDA, DESCRICAO, MEDIDA
      FROM UN_MEDIDAS
      ${where}
      ORDER BY DESCRICAO
    `;
    const rows = await this.dbConnection.executeQuery('producao', dataQuery, params);
    const data = rows.map((r: any) => ({
      un_medida: (r.UN_MEDIDA || '').trim(),
      descricao: (r.DESCRICAO || '').trim(),
      medida: r.MEDIDA,
    }));
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getUnidade(un_medida: string): Promise<{ un_medida: string; descricao: string; medida?: number }> {
    const query = 'SELECT UN_MEDIDA, DESCRICAO, MEDIDA FROM UN_MEDIDAS WHERE UN_MEDIDA = ?';
    const rows = await this.dbConnection.executeQuery('producao', query, [un_medida]);
    if (!rows.length) throw new Error('Unidade não encontrada');
    return {
      un_medida: (rows[0].UN_MEDIDA || '').trim(),
      descricao: (rows[0].DESCRICAO || '').trim(),
      medida: rows[0].MEDIDA,
    };
  }

  async createUnidade(data: { un_medida: string; descricao: string; medida?: number }): Promise<{ un_medida: string; descricao: string; medida?: number }> {
    const insert = 'INSERT INTO UN_MEDIDAS (UN_MEDIDA, DESCRICAO, MEDIDA) VALUES (?, ?, COALESCE(?, 1))';
    await this.dbConnection.executeQuery('producao', insert, [data.un_medida, data.descricao, data.medida ?? 1]);
    return this.getUnidade(data.un_medida);
  }

  async updateUnidade(un_medida: string, data: { descricao?: string; medida?: number }): Promise<{ un_medida: string; descricao: string; medida?: number }> {
    const fields: string[] = [];
    const params: any[] = [];
    if (data.descricao !== undefined) { fields.push('DESCRICAO = ?'); params.push(data.descricao); }
    if (data.medida !== undefined) { fields.push('MEDIDA = ?'); params.push(data.medida); }
    if (!fields.length) throw new Error('Nenhum campo para atualizar');
    params.push(un_medida);
    const update = `UPDATE UN_MEDIDAS SET ${fields.join(', ')} WHERE UN_MEDIDA = ?`;
    await this.dbConnection.executeQuery('producao', update, params);
    return this.getUnidade(un_medida);
  }

  async deleteUnidade(un_medida: string): Promise<boolean> {
    const del = 'DELETE FROM UN_MEDIDAS WHERE UN_MEDIDA = ?';
    await this.dbConnection.executeQuery('producao', del, [un_medida]);
    return true;
  }

  // Secções (TAB_SECCOES)
  async listSeccoes(filters: ListFilters = {}): Promise<PagedResult<{ seccao: number; descricao: string; ordem?: number; situacao?: string }>> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 50;
    const offset = (page - 1) * limit;
    const params: any[] = [];

    let where = " WHERE 1=1 AND COALESCE(SITUACAO, 'ACT') = 'ACT'";
    if (filters.search) {
      where += ' AND (UPPER(DESCRICAO) CONTAINING ? OR CAST(SECCAO AS VARCHAR(20)) LIKE ?)';
      params.push(filters.search.toUpperCase(), `%${filters.search}%`);
    }

    const countQuery = `SELECT COUNT(*) AS TOTAL FROM TAB_SECCOES ${where}`;
    const countRes = await this.dbConnection.executeQuery('producao', countQuery, params);
    const total = countRes[0]?.TOTAL || 0;

    const dataQuery = `
      SELECT FIRST ${limit} SKIP ${offset} SECCAO, DESCRICAO, ORDEM, SITUACAO
      FROM TAB_SECCOES
      ${where}
      ORDER BY ORDEM NULLS LAST, DESCRICAO
    `;
    const rows = await this.dbConnection.executeQuery('producao', dataQuery, params);
    const data = rows.map((r: any) => ({
      seccao: r.SECCAO,
      descricao: (r.DESCRICAO || '').trim(),
      ordem: r.ORDEM,
      situacao: (r.SITUACAO || '').trim(),
    }));
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getSeccao(seccao: number): Promise<{ seccao: number; descricao: string; ordem?: number; situacao?: string }> {
    const query = 'SELECT SECCAO, DESCRICAO, ORDEM, SITUACAO FROM TAB_SECCOES WHERE SECCAO = ?';
    const rows = await this.dbConnection.executeQuery('producao', query, [seccao]);
    if (!rows.length) throw new Error('Secção não encontrada');
    return {
      seccao: rows[0].SECCAO,
      descricao: (rows[0].DESCRICAO || '').trim(),
      ordem: rows[0].ORDEM,
      situacao: (rows[0].SITUACAO || '').trim(),
    };
  }

  async createSeccao(data: { seccao: number; descricao: string; ordem?: number; situacao?: string }): Promise<{ seccao: number; descricao: string; ordem?: number; situacao?: string }> {
    const insert = 'INSERT INTO TAB_SECCOES (SECCAO, DESCRICAO, ORDEM, SITUACAO) VALUES (?, ?, COALESCE(?, 1), COALESCE(?, \"ACT\"))';
    await this.dbConnection.executeQuery('producao', insert, [data.seccao, data.descricao, data.ordem ?? 1, data.situacao || 'ACT']);
    return this.getSeccao(data.seccao);
  }

  async updateSeccao(seccao: number, data: { descricao?: string; ordem?: number; situacao?: string }): Promise<{ seccao: number; descricao: string; ordem?: number; situacao?: string }> {
    const fields: string[] = [];
    const params: any[] = [];
    if (data.descricao !== undefined) { fields.push('DESCRICAO = ?'); params.push(data.descricao); }
    if (data.ordem !== undefined) { fields.push('ORDEM = ?'); params.push(data.ordem); }
    if (data.situacao !== undefined) { fields.push('SITUACAO = ?'); params.push(data.situacao); }
    if (!fields.length) throw new Error('Nenhum campo para atualizar');
    params.push(seccao);
    const update = `UPDATE TAB_SECCOES SET ${fields.join(', ')} WHERE SECCAO = ?`;
    await this.dbConnection.executeQuery('producao', update, params);
    return this.getSeccao(seccao);
  }

  async deleteSeccao(seccao: number): Promise<boolean> {
    const del = 'DELETE FROM TAB_SECCOES WHERE SECCAO = ?';
    await this.dbConnection.executeQuery('producao', del, [seccao]);
    return true;
  }

  // ===== Outras Tabelas =====
  // Auxiliares (TAB_AUXILIARES)
  async listAuxiliares(filters: ListFilters = {}): Promise<PagedResult<{ auxiliar: string; descricao: string; situacao?: string; id?: number }>> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 50;
    const offset = (page - 1) * limit;
    const params: any[] = [];
    let where = " WHERE 1=1 AND COALESCE(SITUACAO, 'ACT') = 'ACT'";
    if (filters.search) {
      where += ' AND (UPPER(DESCRICAO) CONTAINING ? OR UPPER(AUXILIAR) CONTAINING ?)';
      params.push(filters.search.toUpperCase(), filters.search.toUpperCase());
    }
    const count = await this.dbConnection.executeQuery('producao', `SELECT COUNT(*) AS TOTAL FROM TAB_AUXILIARES ${where}`, params);
    const rows = await this.dbConnection.executeQuery('producao', `SELECT FIRST ${limit} SKIP ${offset} ID, AUXILIAR, DESCRICAO, SITUACAO FROM TAB_AUXILIARES ${where} ORDER BY DESCRICAO`, params);
    const data = rows.map((r: any) => ({ id: r.ID, auxiliar: (r.AUXILIAR || '').trim(), descricao: (r.DESCRICAO || '').trim(), situacao: (r.SITUACAO || '').trim() }));
    return { data, total: count[0]?.TOTAL || 0, page, totalPages: Math.ceil((count[0]?.TOTAL || 0) / limit) };
  }
  async getAuxiliar(auxiliar: string): Promise<{ auxiliar: string; descricao: string; situacao?: string; id?: number }> {
    const rows = await this.dbConnection.executeQuery('producao', 'SELECT ID, AUXILIAR, DESCRICAO, SITUACAO FROM TAB_AUXILIARES WHERE AUXILIAR = ?', [auxiliar]);
    if (!rows.length) throw new Error('Auxiliar não encontrado');
    const r = rows[0];
    return { id: r.ID, auxiliar: (r.AUXILIAR || '').trim(), descricao: (r.DESCRICAO || '').trim(), situacao: (r.SITUACAO || '').trim() };
  }
  async createAuxiliar(data: { auxiliar: string; descricao: string; situacao?: string }): Promise<{ auxiliar: string; descricao: string; situacao?: string; id?: number }> {
    const exists = await this.dbConnection.executeQuery('producao', 'SELECT 1 FROM TAB_AUXILIARES WHERE AUXILIAR = ? ROWS 1', [data.auxiliar]);
    if (exists.length) throw new Error('AUXILIAR_JA_EXISTE');
    await this.dbConnection.executeQuery('producao', 'INSERT INTO TAB_AUXILIARES (AUXILIAR, DESCRICAO, SITUACAO) VALUES (?, ?, COALESCE(?, \"ACT\"))', [data.auxiliar, data.descricao, data.situacao || 'ACT']);
    return this.getAuxiliar(data.auxiliar);
  }
  async updateAuxiliar(auxiliar: string, data: { descricao?: string; situacao?: string }): Promise<{ auxiliar: string; descricao: string; situacao?: string; id?: number }> {
    const fields: string[] = []; const params: any[] = [];
    if (data.descricao !== undefined) { fields.push('DESCRICAO = ?'); params.push(data.descricao); }
    if (data.situacao !== undefined) { fields.push('SITUACAO = ?'); params.push(data.situacao); }
    if (!fields.length) throw new Error('Nenhum campo para atualizar');
    params.push(auxiliar);
    await this.dbConnection.executeQuery('producao', `UPDATE TAB_AUXILIARES SET ${fields.join(', ')} WHERE AUXILIAR = ?`, params);
    return this.getAuxiliar(auxiliar);
  }
  async deleteAuxiliar(auxiliar: string): Promise<boolean> {
    await this.dbConnection.executeQuery('producao', 'DELETE FROM TAB_AUXILIARES WHERE AUXILIAR = ?', [auxiliar]);
    return true;
  }

  // Corantes (TAB_CORANTES)
  async listCorantes(filters: ListFilters = {}) { 
    const page = filters.page && filters.page > 0 ? filters.page : 1; const limit = filters.limit && filters.limit > 0 ? filters.limit : 50; const offset = (page - 1) * limit; const params: any[] = [];
    let where = " WHERE 1=1 AND COALESCE(SITUACAO, 'ACT') = 'ACT'";
    if (filters.search) { where += ' AND (UPPER(DESCRICAO) CONTAINING ? OR UPPER(CORANTE) CONTAINING ?)'; params.push(filters.search.toUpperCase(), filters.search.toUpperCase()); }
    const count = await this.dbConnection.executeQuery('producao', `SELECT COUNT(*) AS TOTAL FROM TAB_CORANTES ${where}`, params);
    const rows = await this.dbConnection.executeQuery('producao', `SELECT FIRST ${limit} SKIP ${offset} CORANTE, DESCRICAO, REF_FORN, SITUACAO, CLASSIFICACAO FROM TAB_CORANTES ${where} ORDER BY DESCRICAO`, params);
    const data = rows.map((r: any) => ({ corante: (r.CORANTE || '').trim(), descricao: (r.DESCRICAO || '').trim(), ref_forn: (r.REF_FORN || '').trim(), situacao: (r.SITUACAO || '').trim(), classificacao: (r.CLASSIFICACAO || '').trim() }));
    return { data, total: count[0]?.TOTAL || 0, page, totalPages: Math.ceil((count[0]?.TOTAL || 0) / limit) };
  }
  async getCorante(corante: string) {
    const rows = await this.dbConnection.executeQuery('producao', 'SELECT CORANTE, DESCRICAO, REF_FORN, SITUACAO, CLASSIFICACAO FROM TAB_CORANTES WHERE CORANTE = ?', [corante]);
    if (!rows.length) throw new Error('Corante não encontrado');
    const r = rows[0];
    return { corante: (r.CORANTE || '').trim(), descricao: (r.DESCRICAO || '').trim(), ref_forn: (r.REF_FORN || '').trim(), situacao: (r.SITUACAO || '').trim(), classificacao: (r.CLASSIFICACAO || '').trim() };
  }
  async createCorante(data: { corante: string; descricao: string; ref_forn?: string; situacao?: string; classificacao?: string }) {
    const exists = await this.dbConnection.executeQuery('producao', 'SELECT 1 FROM TAB_CORANTES WHERE CORANTE = ? ROWS 1', [data.corante]);
    if (exists.length) throw new Error('CORANTE_JA_EXISTE');
    await this.dbConnection.executeQuery('producao', 'INSERT INTO TAB_CORANTES (CORANTE, DESCRICAO, REF_FORN, SITUACAO, CLASSIFICACAO) VALUES (?, ?, ?, COALESCE(?, \"ACT\"), ?)', [data.corante, data.descricao, data.ref_forn || '', data.situacao || 'ACT', data.classificacao || '']);
    return this.getCorante(data.corante);
  }
  async updateCorante(corante: string, data: { descricao?: string; ref_forn?: string; situacao?: string; classificacao?: string }) {
    const fields: string[] = []; const params: any[] = [];
    if (data.descricao !== undefined) { fields.push('DESCRICAO = ?'); params.push(data.descricao); }
    if (data.ref_forn !== undefined) { fields.push('REF_FORN = ?'); params.push(data.ref_forn); }
    if (data.situacao !== undefined) { fields.push('SITUACAO = ?'); params.push(data.situacao); }
    if (data.classificacao !== undefined) { fields.push('CLASSIFICACAO = ?'); params.push(data.classificacao); }
    if (!fields.length) throw new Error('Nenhum campo para atualizar');
    params.push(corante);
    await this.dbConnection.executeQuery('producao', `UPDATE TAB_CORANTES SET ${fields.join(', ')} WHERE CORANTE = ?`, params);
    return this.getCorante(corante);
  }
  async deleteCorante(corante: string) { await this.dbConnection.executeQuery('producao', 'DELETE FROM TAB_CORANTES WHERE CORANTE = ?', [corante]); return true; }

  // Cores (TAB_CORES)
  async listCores(filters: ListFilters = {}) {
    const page = filters.page && filters.page > 0 ? filters.page : 1; const limit = filters.limit && filters.limit > 0 ? filters.limit : 50; const offset = (page - 1) * limit; const params: any[] = [];
    let where = " WHERE 1=1 AND COALESCE(SITUACAO, 'ACT') = 'ACT'";
    if (filters.search) { where += ' AND (UPPER(CODIGO_COR) CONTAINING ? OR UPPER(CLASSIFICACAO) CONTAINING ?)'; params.push(filters.search.toUpperCase(), filters.search.toUpperCase()); }
    const count = await this.dbConnection.executeQuery('producao', `SELECT COUNT(*) AS TOTAL FROM TAB_CORES ${where}`, params);
    const rows = await this.dbConnection.executeQuery('producao', `SELECT FIRST ${limit} SKIP ${offset} ID, CODIGO_COR, MALHA, PCUSTO, SITUACAO, CLASSIFICACAO FROM TAB_CORES ${where} ORDER BY CODIGO_COR`, params);
    const data = rows.map((r: any) => ({ id: r.ID, codigo_cor: (r.CODIGO_COR || '').trim(), malha: (r.MALHA || '').trim(), pcusto: r.PCUSTO, situacao: (r.SITUACAO || '').trim(), classificacao: (r.CLASSIFICACAO || '').trim() }));
    return { data, total: count[0]?.TOTAL || 0, page, totalPages: Math.ceil((count[0]?.TOTAL || 0) / limit) };
  }
  async getCor(id: number) { const rows = await this.dbConnection.executeQuery('producao', 'SELECT ID, CODIGO_COR, MALHA, PCUSTO, SITUACAO, CLASSIFICACAO FROM TAB_CORES WHERE ID = ?', [id]); if (!rows.length) throw new Error('Cor não encontrada'); const r = rows[0]; return { id: r.ID, codigo_cor: (r.CODIGO_COR || '').trim(), malha: (r.MALHA || '').trim(), pcusto: r.PCUSTO, situacao: (r.SITUACAO || '').trim(), classificacao: (r.CLASSIFICACAO || '').trim() }; }
  async createCor(data: { id: number; codigo_cor: string; malha?: string; pcusto?: number; situacao?: string; classificacao?: string }) { const exists = await this.dbConnection.executeQuery('producao', 'SELECT 1 FROM TAB_CORES WHERE ID = ? ROWS 1', [data.id]); if (exists.length) throw new Error('COR_JA_EXISTE'); await this.dbConnection.executeQuery('producao', 'INSERT INTO TAB_CORES (ID, CODIGO_COR, MALHA, PCUSTO, SITUACAO, CLASSIFICACAO) VALUES (?, ?, ?, COALESCE(?, 0), COALESCE(?, \"ACT\"), ?)', [data.id, data.codigo_cor, data.malha || '', data.pcusto ?? 0, data.situacao || 'ACT', data.classificacao || '']); return this.getCor(data.id); }
  async updateCor(id: number, data: { codigo_cor?: string; malha?: string; pcusto?: number; situacao?: string; classificacao?: string }) { const fields: string[] = []; const params: any[] = []; if (data.codigo_cor !== undefined) { fields.push('CODIGO_COR = ?'); params.push(data.codigo_cor); } if (data.malha !== undefined) { fields.push('MALHA = ?'); params.push(data.malha); } if (data.pcusto !== undefined) { fields.push('PCUSTO = ?'); params.push(data.pcusto); } if (data.situacao !== undefined) { fields.push('SITUACAO = ?'); params.push(data.situacao); } if (data.classificacao !== undefined) { fields.push('CLASSIFICACAO = ?'); params.push(data.classificacao); } if (!fields.length) throw new Error('Nenhum campo para atualizar'); params.push(id); await this.dbConnection.executeQuery('producao', `UPDATE TAB_CORES SET ${fields.join(', ')} WHERE ID = ?`, params); return this.getCor(id); }
  async deleteCor(id: number) { await this.dbConnection.executeQuery('producao', 'DELETE FROM TAB_CORES WHERE ID = ?', [id]); return true; }

  // Desenhos (TAB_DESENHOS)
  async listDesenhos(filters: ListFilters = {}) { const page = filters.page && filters.page > 0 ? filters.page : 1; const limit = filters.limit && filters.limit > 0 ? filters.limit : 50; const offset = (page - 1) * limit; const params: any[] = []; let where = ' WHERE 1=1'; if (filters.search) { where += ' AND (UPPER(DESCRICAO) CONTAINING ? OR CAST(DESENHO AS VARCHAR(20)) LIKE ?)'; params.push(filters.search.toUpperCase(), `%${filters.search}%`); } const count = await this.dbConnection.executeQuery('producao', `SELECT COUNT(*) AS TOTAL FROM TAB_DESENHOS ${where}`, params); const rows = await this.dbConnection.executeQuery('producao', `SELECT FIRST ${limit} SKIP ${offset} DESENHO, DESCRICAO, CLIENTE FROM TAB_DESENHOS ${where} ORDER BY DESCRICAO`, params); const data = rows.map((r: any) => ({ desenho: r.DESENHO, descricao: (r.DESCRICAO || '').trim(), cliente: r.CLIENTE })); return { data, total: count[0]?.TOTAL || 0, page, totalPages: Math.ceil((count[0]?.TOTAL || 0) / limit) }; }
  async getDesenho(desenho: number) { const rows = await this.dbConnection.executeQuery('producao', 'SELECT DESENHO, DESCRICAO, CLIENTE FROM TAB_DESENHOS WHERE DESENHO = ?', [desenho]); if (!rows.length) throw new Error('Desenho não encontrado'); const r = rows[0]; return { desenho: r.DESENHO, descricao: (r.DESCRICAO || '').trim(), cliente: r.CLIENTE }; }
  async createDesenho(data: { desenho: number; descricao: string; cliente?: number }) { const exists = await this.dbConnection.executeQuery('producao', 'SELECT 1 FROM TAB_DESENHOS WHERE DESENHO = ? ROWS 1', [data.desenho]); if (exists.length) throw new Error('DESENHO_JA_EXISTE'); await this.dbConnection.executeQuery('producao', 'INSERT INTO TAB_DESENHOS (DESENHO, DESCRICAO, CLIENTE) VALUES (?, ?, COALESCE(?, 0))', [data.desenho, data.descricao, data.cliente ?? 0]); return this.getDesenho(data.desenho); }
  async updateDesenho(desenho: number, data: { descricao?: string; cliente?: number }) { const fields: string[] = []; const params: any[] = []; if (data.descricao !== undefined) { fields.push('DESCRICAO = ?'); params.push(data.descricao); } if (data.cliente !== undefined) { fields.push('CLIENTE = ?'); params.push(data.cliente); } if (!fields.length) throw new Error('Nenhum campo para atualizar'); params.push(desenho); await this.dbConnection.executeQuery('producao', `UPDATE TAB_DESENHOS SET ${fields.join(', ')} WHERE DESENHO = ?`, params); return this.getDesenho(desenho); }
  async deleteDesenho(desenho: number) { await this.dbConnection.executeQuery('producao', 'DELETE FROM TAB_DESENHOS WHERE DESENHO = ?', [desenho]); return true; }

  // Estados (TAB_ESTADOS)
  async listEstados(filters: ListFilters = {}) { const page = filters.page && filters.page > 0 ? filters.page : 1; const limit = filters.limit && filters.limit > 0 ? filters.limit : 50; const offset = (page - 1) * limit; const params: any[] = []; let where = " WHERE 1=1 AND COALESCE(SITUACAO, 'ACT') = 'ACT'"; if (filters.search) { where += ' AND (UPPER(DESCRICAO) CONTAINING ? OR CAST(ID AS VARCHAR(20)) LIKE ?)'; params.push(filters.search.toUpperCase(), `%${filters.search}%`); } const count = await this.dbConnection.executeQuery('producao', `SELECT COUNT(*) AS TOTAL FROM TAB_ESTADOS ${where}`, params); const rows = await this.dbConnection.executeQuery('producao', `SELECT FIRST ${limit} SKIP ${offset} ID, DESCRICAO, MOVIMENTA, SITUACAO FROM TAB_ESTADOS ${where} ORDER BY ID`, params); const data = rows.map((r: any) => ({ id: r.ID, descricao: (r.DESCRICAO || '').trim(), movimenta: r.MOVIMENTA, situacao: (r.SITUACAO || '').trim() })); return { data, total: count[0]?.TOTAL || 0, page, totalPages: Math.ceil((count[0]?.TOTAL || 0) / limit) }; }
  async getEstado(id: number) { const rows = await this.dbConnection.executeQuery('producao', 'SELECT ID, DESCRICAO, MOVIMENTA, SITUACAO FROM TAB_ESTADOS WHERE ID = ?', [id]); if (!rows.length) throw new Error('Estado não encontrado'); const r = rows[0]; return { id: r.ID, descricao: (r.DESCRICAO || '').trim(), movimenta: r.MOVIMENTA, situacao: (r.SITUACAO || '').trim() }; }
  async createEstado(data: { id: number; descricao: string; movimenta?: any; situacao?: string }) { const exists = await this.dbConnection.executeQuery('producao', 'SELECT 1 FROM TAB_ESTADOS WHERE ID = ? ROWS 1', [data.id]); if (exists.length) throw new Error('ESTADO_JA_EXISTE'); await this.dbConnection.executeQuery('producao', 'INSERT INTO TAB_ESTADOS (ID, DESCRICAO, MOVIMENTA, SITUACAO) VALUES (?, ?, ?, COALESCE(?, \"ACT\"))', [data.id, data.descricao, data.movimenta ?? null, data.situacao || 'ACT']); return this.getEstado(data.id); }
  async updateEstado(id: number, data: { descricao?: string; movimenta?: any; situacao?: string }) { const fields: string[] = []; const params: any[] = []; if (data.descricao !== undefined) { fields.push('DESCRICAO = ?'); params.push(data.descricao); } if (data.movimenta !== undefined) { fields.push('MOVIMENTA = ?'); params.push(data.movimenta); } if (data.situacao !== undefined) { fields.push('SITUACAO = ?'); params.push(data.situacao); } if (!fields.length) throw new Error('Nenhum campo para atualizar'); params.push(id); await this.dbConnection.executeQuery('producao', `UPDATE TAB_ESTADOS SET ${fields.join(', ')} WHERE ID = ?`, params); return this.getEstado(id); }
  async deleteEstado(id: number) { await this.dbConnection.executeQuery('producao', 'DELETE FROM TAB_ESTADOS WHERE ID = ?', [id]); return true; }

  // Maquinas (TAB_MAQUINAS)
  async listMaquinas(filters: ListFilters = {}) { const page = filters.page && filters.page > 0 ? filters.page : 1; const limit = filters.limit && filters.limit > 0 ? filters.limit : 50; const offset = (page - 1) * limit; const params: any[] = []; let where = " WHERE 1=1 AND COALESCE(SITUACAO, 'ACT') = 'ACT'"; if (filters.search) { where += ' AND (UPPER(DESCRICAO) CONTAINING ? OR CAST(MAQUINA AS VARCHAR(20)) LIKE ?)'; params.push(filters.search.toUpperCase(), `%${filters.search}%`); } const count = await this.dbConnection.executeQuery('producao', `SELECT COUNT(*) AS TOTAL FROM TAB_MAQUINAS ${where}`, params); const rows = await this.dbConnection.executeQuery('producao', `SELECT FIRST ${limit} SKIP ${offset} MAQUINA, DESCRICAO, OBSERVACOES, SITUACAO, SECCAO, ORDEM FROM TAB_MAQUINAS ${where} ORDER BY ORDEM NULLS LAST, DESCRICAO`, params); const data = rows.map((r: any) => ({ maquina: r.MAQUINA, descricao: (r.DESCRICAO || '').trim(), observacoes: (r.OBSERVACOES || '').trim(), situacao: (r.SITUACAO || '').trim(), seccao: r.SECCAO, ordem: r.ORDEM })); return { data, total: count[0]?.TOTAL || 0, page, totalPages: Math.ceil((count[0]?.TOTAL || 0) / limit) }; }
  async getMaquina(maquina: number) { const rows = await this.dbConnection.executeQuery('producao', 'SELECT MAQUINA, DESCRICAO, OBSERVACOES, SITUACAO, SECCAO, ORDEM FROM TAB_MAQUINAS WHERE MAQUINA = ?', [maquina]); if (!rows.length) throw new Error('Máquina não encontrada'); const r = rows[0]; return { maquina: r.MAQUINA, descricao: (r.DESCRICAO || '').trim(), observacoes: (r.OBSERVACOES || '').trim(), situacao: (r.SITUACAO || '').trim(), seccao: r.SECCAO, ordem: r.ORDEM }; }
  async createMaquina(data: { maquina: number; descricao: string; observacoes?: string; situacao?: string; seccao?: number; ordem?: number }) { const exists = await this.dbConnection.executeQuery('producao', 'SELECT 1 FROM TAB_MAQUINAS WHERE MAQUINA = ? ROWS 1', [data.maquina]); if (exists.length) throw new Error('MAQUINA_JA_EXISTE'); await this.dbConnection.executeQuery('producao', 'INSERT INTO TAB_MAQUINAS (MAQUINA, DESCRICAO, OBSERVACOES, SITUACAO, SECCAO, ORDEM) VALUES (?, ?, ?, COALESCE(?, \"ACT\"), COALESCE(?, 1), COALESCE(?, 1))', [data.maquina, data.descricao, data.observacoes || '', data.situacao || 'ACT', data.seccao ?? 1, data.ordem ?? 1]); return this.getMaquina(data.maquina); }
  async updateMaquina(maquina: number, data: { descricao?: string; observacoes?: string; situacao?: string; seccao?: number; ordem?: number }) { const fields: string[] = []; const params: any[] = []; if (data.descricao !== undefined) { fields.push('DESCRICAO = ?'); params.push(data.descricao); } if (data.observacoes !== undefined) { fields.push('OBSERVACOES = ?'); params.push(data.observacoes); } if (data.situacao !== undefined) { fields.push('SITUACAO = ?'); params.push(data.situacao); } if (data.seccao !== undefined) { fields.push('SECCAO = ?'); params.push(data.seccao); } if (data.ordem !== undefined) { fields.push('ORDEM = ?'); params.push(data.ordem); } if (!fields.length) throw new Error('Nenhum campo para atualizar'); params.push(maquina); await this.dbConnection.executeQuery('producao', `UPDATE TAB_MAQUINAS SET ${fields.join(', ')} WHERE MAQUINA = ?`, params); return this.getMaquina(maquina); }
  async deleteMaquina(maquina: number) { await this.dbConnection.executeQuery('producao', 'DELETE FROM TAB_MAQUINAS WHERE MAQUINA = ?', [maquina]); return true; }

  // Operacoes (TAB_OPERACOES)
  async listOperacoes(filters: ListFilters = {}) { const page = filters.page && filters.page > 0 ? filters.page : 1; const limit = filters.limit && filters.limit > 0 ? filters.limit : 50; const offset = (page - 1) * limit; const params: any[] = []; let where = ' WHERE 1=1'; if (filters.search) { where += ' AND (UPPER(DESCRICAO) CONTAINING ? OR CAST(OPERACAO AS VARCHAR(20)) LIKE ?)'; params.push(filters.search.toUpperCase(), `%${filters.search}%`); } const count = await this.dbConnection.executeQuery('producao', `SELECT COUNT(*) AS TOTAL FROM TAB_OPERACOES ${where}`, params); const rows = await this.dbConnection.executeQuery('producao', `SELECT FIRST ${limit} SKIP ${offset} OPERACAO, DESCRICAO FROM TAB_OPERACOES ${where} ORDER BY OPERACAO`, params); const data = rows.map((r: any) => ({ operacao: r.OPERACAO, descricao: (r.DESCRICAO || '').trim() })); return { data, total: count[0]?.TOTAL || 0, page, totalPages: Math.ceil((count[0]?.TOTAL || 0) / limit) }; }
  async getOperacao(operacao: number) { const rows = await this.dbConnection.executeQuery('producao', 'SELECT OPERACAO, DESCRICAO FROM TAB_OPERACOES WHERE OPERACAO = ?', [operacao]); if (!rows.length) throw new Error('Operação não encontrada'); const r = rows[0]; return { operacao: r.OPERACAO, descricao: (r.DESCRICAO || '').trim() }; }
  async createOperacao(data: { operacao: number; descricao: string }) { const exists = await this.dbConnection.executeQuery('producao', 'SELECT 1 FROM TAB_OPERACOES WHERE OPERACAO = ? ROWS 1', [data.operacao]); if (exists.length) throw new Error('OPERACAO_JA_EXISTE'); await this.dbConnection.executeQuery('producao', 'INSERT INTO TAB_OPERACOES (OPERACAO, DESCRICAO) VALUES (?, ?)', [data.operacao, data.descricao]); return this.getOperacao(data.operacao); }
  async updateOperacao(operacao: number, data: { descricao?: string }) { const fields: string[] = []; const params: any[] = []; if (data.descricao !== undefined) { fields.push('DESCRICAO = ?'); params.push(data.descricao); } if (!fields.length) throw new Error('Nenhum campo para atualizar'); params.push(operacao); await this.dbConnection.executeQuery('producao', `UPDATE TAB_OPERACOES SET ${fields.join(', ')} WHERE OPERACAO = ?`, params); return this.getOperacao(operacao); }
  async deleteOperacao(operacao: number) { await this.dbConnection.executeQuery('producao', 'DELETE FROM TAB_OPERACOES WHERE OPERACAO = ?', [operacao]); return true; }

  // Processos (TAB_PROCESSOS)
  async listProcessos(filters: ListFilters = {}) { const page = filters.page && filters.page > 0 ? filters.page : 1; const limit = filters.limit && filters.limit > 0 ? filters.limit : 50; const offset = (page - 1) * limit; const params: any[] = []; let where = " WHERE 1=1 AND COALESCE(SITUACAO, 'ACT') = 'ACT'"; if (filters.search) { where += ' AND (UPPER(DESCRICAO) CONTAINING ? OR CAST(ID AS VARCHAR(20)) LIKE ?)'; params.push(filters.search.toUpperCase(), `%${filters.search}%`); } const count = await this.dbConnection.executeQuery('producao', `SELECT COUNT(*) AS TOTAL FROM TAB_PROCESSOS ${where}`, params); const rows = await this.dbConnection.executeQuery('producao', `SELECT FIRST ${limit} SKIP ${offset} ID, DESCRICAO, ORDEM, ID_PAI, SITUACAO, USA_COR, ESTAMPARIA FROM TAB_PROCESSOS ${where} ORDER BY ORDEM NULLS LAST, DESCRICAO`, params); const data = rows.map((r: any) => ({ id: r.ID, descricao: (r.DESCRICAO || '').trim(), ordem: r.ORDEM, id_pai: r.ID_PAI, situacao: (r.SITUACAO || '').trim(), usa_cor: r.USA_COR, estamparia: r.ESTAMPARIA })); return { data, total: count[0]?.TOTAL || 0, page, totalPages: Math.ceil((count[0]?.TOTAL || 0) / limit) }; }
  async getProcesso(id: number) { const rows = await this.dbConnection.executeQuery('producao', 'SELECT ID, DESCRICAO, ORDEM, ID_PAI, SITUACAO, USA_COR, ESTAMPARIA FROM TAB_PROCESSOS WHERE ID = ?', [id]); if (!rows.length) throw new Error('Processo não encontrado'); const r = rows[0]; return { id: r.ID, descricao: (r.DESCRICAO || '').trim(), ordem: r.ORDEM, id_pai: r.ID_PAI, situacao: (r.SITUACAO || '').trim(), usa_cor: r.USA_COR, estamparia: r.ESTAMPARIA } }
  async createProcesso(data: { id: number; descricao: string; ordem?: number; id_pai?: number; situacao?: string }) { const exists = await this.dbConnection.executeQuery('producao', 'SELECT 1 FROM TAB_PROCESSOS WHERE ID = ? ROWS 1', [data.id]); if (exists.length) throw new Error('PROCESSO_JA_EXISTE'); await this.dbConnection.executeQuery('producao', 'INSERT INTO TAB_PROCESSOS (ID, DESCRICAO, ORDEM, ID_PAI, SITUACAO) VALUES (?, ?, COALESCE(?, 1), COALESCE(?, NULL), COALESCE(?, \"ACT\"))', [data.id, data.descricao, data.ordem ?? 1, data.id_pai ?? null, data.situacao || 'ACT']); return this.getProcesso(data.id); }
  async updateProcesso(id: number, data: { descricao?: string; ordem?: number; id_pai?: number; situacao?: string }) { const fields: string[] = []; const params: any[] = []; if (data.descricao !== undefined) { fields.push('DESCRICAO = ?'); params.push(data.descricao); } if (data.ordem !== undefined) { fields.push('ORDEM = ?'); params.push(data.ordem); } if (data.id_pai !== undefined) { fields.push('ID_PAI = ?'); params.push(data.id_pai); } if (data.situacao !== undefined) { fields.push('SITUACAO = ?'); params.push(data.situacao); } if (!fields.length) throw new Error('Nenhum campo para atualizar'); params.push(id); await this.dbConnection.executeQuery('producao', `UPDATE TAB_PROCESSOS SET ${fields.join(', ')} WHERE ID = ?`, params); return this.getProcesso(id); }
  async deleteProcesso(id: number) { await this.dbConnection.executeQuery('producao', 'DELETE FROM TAB_PROCESSOS WHERE ID = ?', [id]); return true; }

  // Terminais (TAB_TERMINAIS)
  async listTerminais(filters: ListFilters = {}) { const page = filters.page && filters.page > 0 ? filters.page : 1; const limit = filters.limit && filters.limit > 0 ? filters.limit : 50; const offset = (page - 1) * limit; const params: any[] = []; let where = ' WHERE 1=1'; if (filters.search) { where += ' AND (UPPER(TERMINAL) CONTAINING ? OR CAST(MAQUINA AS VARCHAR(20)) LIKE ?)'; params.push(filters.search.toUpperCase(), `%${filters.search}%`); } const count = await this.dbConnection.executeQuery('producao', `SELECT COUNT(*) AS TOTAL FROM TAB_TERMINAIS ${where}`, params); const rows = await this.dbConnection.executeQuery('producao', `SELECT FIRST ${limit} SKIP ${offset} TERMINAL, MAQUINA FROM TAB_TERMINAIS ${where} ORDER BY TERMINAL`, params); const data = rows.map((r: any) => ({ terminal: (r.TERMINAL || '').trim(), maquina: r.MAQUINA })); return { data, total: count[0]?.TOTAL || 0, page, totalPages: Math.ceil((count[0]?.TOTAL || 0) / limit) }; }
  async getTerminal(terminal: string) { const rows = await this.dbConnection.executeQuery('producao', 'SELECT TERMINAL, MAQUINA FROM TAB_TERMINAIS WHERE TERMINAL = ?', [terminal]); if (!rows.length) throw new Error('Terminal não encontrado'); const r = rows[0]; return { terminal: (r.TERMINAL || '').trim(), maquina: r.MAQUINA }; }
  async createTerminal(data: { terminal: string; maquina?: number }) { const exists = await this.dbConnection.executeQuery('producao', 'SELECT 1 FROM TAB_TERMINAIS WHERE TERMINAL = ? ROWS 1', [data.terminal]); if (exists.length) throw new Error('TERMINAL_JA_EXISTE'); await this.dbConnection.executeQuery('producao', 'INSERT INTO TAB_TERMINAIS (TERMINAL, MAQUINA) VALUES (?, COALESCE(?, NULL))', [data.terminal, data.maquina ?? null]); return this.getTerminal(data.terminal); }
  async updateTerminal(terminal: string, data: { maquina?: number }) { const fields: string[] = []; const params: any[] = []; if (data.maquina !== undefined) { fields.push('MAQUINA = ?'); params.push(data.maquina); } if (!fields.length) throw new Error('Nenhum campo para atualizar'); params.push(terminal); await this.dbConnection.executeQuery('producao', `UPDATE TAB_TERMINAIS SET ${fields.join(', ')} WHERE TERMINAL = ?`, params); return this.getTerminal(terminal); }
  async deleteTerminal(terminal: string) { await this.dbConnection.executeQuery('producao', 'DELETE FROM TAB_TERMINAIS WHERE TERMINAL = ?', [terminal]); return true; }

  // Utilizadores (TAB_UTILIZADORES) - tabela Firebird
  async listUtilizadores(filters: ListFilters = {}) { const page = filters.page && filters.page > 0 ? filters.page : 1; const limit = filters.limit && filters.limit > 0 ? filters.limit : 50; const offset = (page - 1) * limit; const params: any[] = []; let where = ' WHERE 1=1'; if (filters.search) { where += ' AND (UPPER(UTILIZADOR) CONTAINING ? OR UPPER(SENHA) CONTAINING ?)'; params.push(filters.search.toUpperCase(), filters.search.toUpperCase()); } const count = await this.dbConnection.executeQuery('producao', `SELECT COUNT(*) AS TOTAL FROM TAB_UTILIZADORES ${where}`, params); const rows = await this.dbConnection.executeQuery('producao', `SELECT FIRST ${limit} SKIP ${offset} UTILIZADOR, NIVEL, SECCAO, ADMINISTRADOR FROM TAB_UTILIZADORES ${where} ORDER BY UTILIZADOR`, params); const data = rows.map((r: any) => ({ utilizador: (r.UTILIZADOR || '').trim(), nivel: r.NIVEL, seccao: r.SECCAO, administrador: r.ADMINISTRADOR })); return { data, total: count[0]?.TOTAL || 0, page, totalPages: Math.ceil((count[0]?.TOTAL || 0) / limit) }; }
  async getUtilizador(utilizador: string) { const rows = await this.dbConnection.executeQuery('producao', 'SELECT UTILIZADOR, SENHA, NIVEL, VALIDADE, ULTIMO_LOGIN, NR_LOGINS, SECCAO, ADMINISTRADOR FROM TAB_UTILIZADORES WHERE UTILIZADOR = ?', [utilizador]); if (!rows.length) throw new Error('Utilizador não encontrado'); const r = rows[0]; return { utilizador: (r.UTILIZADOR || '').trim(), senha: (r.SENHA || '').trim(), nivel: r.NIVEL, validade: r.VALIDADE, ultimo_login: r.ULTIMO_LOGIN, nr_logins: r.NR_LOGINS, seccao: r.SECCAO, administrador: r.ADMINISTRADOR } }
  async createUtilizador(data: { utilizador: string; senha: string; nivel?: number; seccao?: number; administrador?: any }) { const exists = await this.dbConnection.executeQuery('producao', 'SELECT 1 FROM TAB_UTILIZADORES WHERE UTILIZADOR = ? ROWS 1', [data.utilizador]); if (exists.length) throw new Error('UTILIZADOR_JA_EXISTE'); await this.dbConnection.executeQuery('producao', 'INSERT INTO TAB_UTILIZADORES (UTILIZADOR, SENHA, NIVEL, SECCAO, ADMINISTRADOR) VALUES (?, ?, COALESCE(?, 0), COALESCE(?, 1), COALESCE(?, NULL))', [data.utilizador, data.senha, data.nivel ?? 0, data.seccao ?? 1, data.administrador ?? null]); return this.getUtilizador(data.utilizador); }
  async updateUtilizador(utilizador: string, data: { senha?: string; nivel?: number; seccao?: number; administrador?: any }) { const fields: string[] = []; const params: any[] = []; if (data.senha !== undefined) { fields.push('SENHA = ?'); params.push(data.senha); } if (data.nivel !== undefined) { fields.push('NIVEL = ?'); params.push(data.nivel); } if (data.seccao !== undefined) { fields.push('SECCAO = ?'); params.push(data.seccao); } if (data.administrador !== undefined) { fields.push('ADMINISTRADOR = ?'); params.push(data.administrador); } if (!fields.length) throw new Error('Nenhum campo para atualizar'); params.push(utilizador); await this.dbConnection.executeQuery('producao', `UPDATE TAB_UTILIZADORES SET ${fields.join(', ')} WHERE UTILIZADOR = ?`, params); return this.getUtilizador(utilizador); }
  async deleteUtilizador(utilizador: string) { await this.dbConnection.executeQuery('producao', 'DELETE FROM TAB_UTILIZADORES WHERE UTILIZADOR = ?', [utilizador]); return true; }
}
