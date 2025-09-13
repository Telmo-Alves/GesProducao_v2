import { DatabaseConnection } from '../config/database';
import { ConfigManager } from '../config/config';
import { 
  MovRecepcao, 
  CreateMovRecepcaoRequest, 
  UpdateMovRecepcaoRequest, 
  MovRecepcaoFilters,
  MovRecepcaoListResponse,
  Cliente,
  Artigo,
  Composicao
} from '../types/recepcao';

export class RecepcaoService {
  private dbConnection: DatabaseConnection;

  constructor() {
    const config = ConfigManager.getInstance().getConfig();
    this.dbConnection = DatabaseConnection.getInstance(config);
  }

  async createRecepcao(data: CreateMovRecepcaoRequest, utilizador: string): Promise<MovRecepcao> {
    const now = new Date();
    
    // Obter próxima linha para a data e secção
    const nextLinha = await this.getNextLinha(data.seccao, data.data);

    const query = `
      INSERT INTO MOV_RECEPCAO (
        SECCAO, DATA, LINHA, CLIENTE, NOME, CODIGO, DESCRICAO, 
        COMPOSICAO, COMPOSICAO_DESCRICAO, ROLOS, PESOS, GRAMAGEM, MEDIDAS,
        BRANQUEAR, DESENCOLAR, TINGIR, ROLOS_ENTREGUES, PESOS_ENTREGUES, 
        REQUISICAO, UTILIZADOR, DATA_REG
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.dbConnection.executeQuery('producao', query, [
      data.seccao,
      data.data,
      nextLinha,
      data.cliente,
      data.nome,
      data.codigo,
      data.descricao,
      data.composicao,
      data.composicao_descricao,
      data.rolos,
      data.pesos,
      data.gramagem || 0,
      data.medidas || 0,
      data.branquear,
      data.desencolar,
      data.tingir,
      data.rolos_entregues || 0,
      data.pesos_entregues || 0,
      data.requisicao || '',
      utilizador,
      now
    ]);

    // Retornar o registro criado
    return this.getRecepcaoById(data.seccao, data.data, nextLinha);
  }

  async getAllRecepcoes(filters: MovRecepcaoFilters = {}): Promise<MovRecepcaoListResponse> {
    const { page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;

    let whereClause = ' AND ROLOS_ENTREGUES < ROLOS';
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.seccao) {
      whereClause += ` AND SECCAO = ?`;
      params.push(filters.seccao);
    }

    if (filters.dataInicio) {
      whereClause += ` AND DATA >= ?`;
      params.push(filters.dataInicio);
    }

    if (filters.dataFim) {
      whereClause += ` AND DATA <= ?`;
      params.push(filters.dataFim);
    }

    if (filters.cliente) {
      whereClause += ` AND CLIENTE = ?`;
      params.push(filters.cliente);
    }

    if (filters.nome) {
      whereClause += ` AND UPPER(NOME) CONTAINING ?`;
      params.push(filters.nome.toUpperCase());
    }

    if (filters.codigo) {
      whereClause += ` AND CODIGO = ?`;
      params.push(filters.codigo);
    }

    if (filters.composicao) {
      whereClause += ` AND COMPOSICAO = ?`;
      params.push(filters.composicao);
    }

    if (filters.branquear) {
      whereClause += ` AND BRANQUEAR = ?`;
      params.push(filters.branquear);
    }

    if (filters.desencolar) {
      whereClause += ` AND DESENCOLAR = ?`;
      params.push(filters.desencolar);
    }

    if (filters.tingir) {
      whereClause += ` AND TINGIR = ?`;
      params.push(filters.tingir);
    }

    if (filters.utilizador) {
      whereClause += ` AND UPPER(UTILIZADOR) CONTAINING ?`;
      params.push(filters.utilizador.toUpperCase());
    }

    if (filters.requisicao) {
      whereClause += ` AND UPPER(REQUISICAO) CONTAINING ?`;
      params.push(filters.requisicao.toUpperCase());
    }

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as TOTAL 
      FROM MOV_RECEPCAO 
      WHERE 1=1 ${whereClause}
    `;

    const countResult = await this.dbConnection.executeQuery('producao', countQuery, params);
    const total = countResult[0].TOTAL;

    // Query para obter dados paginados
    const dataQuery = `
      SELECT FIRST ${limit} SKIP ${offset} *
      FROM MOV_RECEPCAO 
      WHERE 1=1 ${whereClause}
      ORDER BY DATA DESC, LINHA DESC
    `;

    const result = await this.dbConnection.executeQuery('producao', dataQuery, params);
    const data = result.map(this.mapRowToRecepcao);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getRecepcaoById(seccao: number, data: Date, linha: number): Promise<MovRecepcao> {
    const query = `
      SELECT * FROM MOV_RECEPCAO 
      WHERE SECCAO = ? AND DATA = ? AND LINHA = ?
    `;

    const result = await this.dbConnection.executeQuery('producao', query, [seccao, data, linha]);
    
    if (result.length === 0) {
      throw new Error('Registro de recepção não encontrado');
    }

    return this.mapRowToRecepcao(result[0]);
  }

  async updateRecepcao(
    seccao: number, 
    data: Date, 
    linha: number, 
    updateData: UpdateMovRecepcaoRequest
  ): Promise<MovRecepcao> {
    const updateFields: string[] = [];
    const values: any[] = [];

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key.toUpperCase()} = ?`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    values.push(seccao, data, linha);

    const query = `
      UPDATE MOV_RECEPCAO 
      SET ${updateFields.join(', ')}
      WHERE SECCAO = ? AND DATA = ? AND LINHA = ?
    `;

    await this.dbConnection.executeQuery('producao', query, values);
    return this.getRecepcaoById(seccao, data, linha);
  }

  async deleteRecepcao(seccao: number, data: Date, linha: number): Promise<boolean> {
    const query = `
      DELETE FROM MOV_RECEPCAO 
      WHERE SECCAO = ? AND DATA = ? AND LINHA = ?
    `;

    await this.dbConnection.executeQuery('producao', query, [seccao, data, linha]);
    return true;
  }

  async fecharRecepcao(seccao: number, data: Date, linha: number): Promise<boolean> {
    const query = `
      EXECUTE PROCEDURE Fechar_Mov_Recepcao(?, ?, ?)
    `;

    await this.dbConnection.executeQuery('producao', query, [seccao, data, linha]);
    return true;
  }

  // Métodos auxiliares para buscar dados de lookup
  async getClientes(): Promise<Cliente[]> {
    const query = `
      SELECT DISTINCT CLIENTE as CODIGO, NOME 
      FROM MOV_RECEPCAO 
      ORDER BY NOME
    `;

    const result = await this.dbConnection.executeQuery('producao', query);
    return result.map(row => ({
      codigo: row.CODIGO,
      nome: row.NOME?.trim() || ''
    }));
  }

  async getArtigos(): Promise<Artigo[]> {
    const query = `
      SELECT DISTINCT CODIGO, DESCRICAO 
      FROM MOV_RECEPCAO 
      ORDER BY DESCRICAO
    `;

    const result = await this.dbConnection.executeQuery('producao', query);
    return result.map(row => ({
      codigo: row.CODIGO,
      descricao: row.DESCRICAO?.trim() || ''
    }));
  }

  async getComposicoes(): Promise<Composicao[]> {
    const query = `
      SELECT DISTINCT COMPOSICAO as CODIGO, COMPOSICAO_DESCRICAO as DESCRICAO 
      FROM MOV_RECEPCAO 
      ORDER BY COMPOSICAO_DESCRICAO
    `;

    const result = await this.dbConnection.executeQuery('producao', query);
    return result.map(row => ({
      codigo: row.CODIGO,
      descricao: row.DESCRICAO?.trim() || ''
    }));
  }

  private async getNextLinha(seccao: number, data: Date): Promise<number> {
    const query = `
      SELECT MAX(LINHA) as MAX_LINHA 
      FROM MOV_RECEPCAO 
      WHERE SECCAO = ? AND DATA = ?
    `;

    const result = await this.dbConnection.executeQuery('producao', query, [seccao, data]);
    const maxLinha = result[0]?.MAX_LINHA || 0;
    return maxLinha + 1;
  }

  private mapRowToRecepcao(row: any): MovRecepcao {
    return {
      seccao: row.SECCAO,
      data: new Date(row.DATA),
      linha: row.LINHA,
      cliente: row.CLIENTE,
      nome: row.NOME?.trim() || '',
      codigo: row.CODIGO,
      descricao: row.DESCRICAO?.trim() || '',
      composicao: row.COMPOSICAO,
      composicao_descricao: row.COMPOSICAO_DESCRICAO?.trim() || '',
      rolos: row.ROLOS,
      pesos: row.PESOS,
      gramagem: row.GRAMAGEM,
      medidas: row.MEDIDAS,
      branquear: row.BRANQUEAR?.trim() as 'S' | 'N',
      desencolar: row.DESENCOLAR?.trim() as 'S' | 'N',
      tingir: row.TINGIR?.trim() as 'S' | 'N',
      rolos_entregues: row.ROLOS_ENTREGUES,
      pesos_entregues: row.PESOS_ENTREGUES,
      requisicao: row.REQUISICAO?.trim() || '',
      utilizador: row.UTILIZADOR?.trim() || '',
      data_reg: new Date(row.DATA_REG)
    };
  }
}