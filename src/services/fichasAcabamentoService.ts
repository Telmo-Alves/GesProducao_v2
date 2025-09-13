import { DatabaseConnection } from '../config/database';
import { ConfigManager } from '../config/config';

export interface FichaAcabamentoItem {
  movRecSeccao: number;
  movRecData: Date;
  movRecLinha: number;
  rolos: number;
  pesos: number;
}

export class FichasAcabamentoService {
  private dbConnection: DatabaseConnection;

  constructor() {
    const config = ConfigManager.getInstance().getConfig();
    this.dbConnection = DatabaseConnection.getInstance(config);
  }

  private async getEstadoAguardarId(): Promise<number> {
    const q = "SELECT ID FROM TAB_ESTADOS WHERE COALESCE(SITUACAO,'ACT')='ACT' AND UPPER(DESCRICAO) CONTAINING 'AGUARD' ROWS 1";
    const r = await this.dbConnection.executeQuery('producao', q);
    return r?.[0]?.ID ?? 1;
  }

  private async getClienteFromMov(seccao: number, data: Date, linha: number): Promise<number | null> {
    const q = 'SELECT CLIENTE FROM MOV_RECEPCAO WHERE SECCAO = ? AND DATA = ? AND LINHA = ? ROWS 1';
    const r = await this.dbConnection.executeQuery('producao', q, [seccao, data, linha]);
    return r?.[0]?.CLIENTE ?? null;
  }

  async criarFichaEntrada(
    seccao: number,
    data: Date,
    totalRolos: number,
    totalPesos: number,
    estado: number | undefined,
    obs: string,
    itens: FichaAcabamentoItem[]
  ): Promise<{ faNumero: number; linhas: number }> {
    // Validar que todos os movimentos são do mesmo cliente
    let firstCliente: number | null = null;
    for (const it of itens) {
      const c = await this.getClienteFromMov(it.movRecSeccao, it.movRecData, it.movRecLinha);
      if (c == null) throw new Error('MOV_RECEPCAO inválido');
      if (firstCliente == null) firstCliente = c; else if (firstCliente !== c) {
        throw new Error('CLIENTES_DIFERENTES');
      }
    }

    // 1) Criar ficha de entrada e obter número
    const queryFA = 'SELECT R_FA_NUMERO FROM Grava_Ficha_Entrada(?, ?, ?, ?, ?, ?)';
    const estadoId = typeof estado === 'number' ? estado : await this.getEstadoAguardarId();
    const faRes = await this.dbConnection.executeQuery('producao', queryFA, [
      seccao,
      data,
      totalRolos,
      totalPesos,
      estadoId,
      obs || ''
    ]);

    const faNumero = faRes?.[0]?.R_FA_NUMERO ?? 0;
    if (!faNumero) {
      throw new Error('Falha ao gravar ficha de entrada');
    }

    // 2) Gravar movimentos associados
    const queryMov = 'SELECT R_Linha FROM Grava_FA_Mov_Recepcao(?, ?, ?, ?, ?, ?, ?, ?, ?)';
    let linhas = 0;
    for (const item of itens) {
      await this.dbConnection.executeQuery('producao', queryMov, [
        seccao,
        data,
        faNumero,
        0, // Linha calculada no SP
        item.movRecSeccao,
        item.movRecData,
        item.movRecLinha,
        item.rolos,
        item.pesos,
      ]);
      linhas += 1;
    }

    return { faNumero, linhas };
  }
}
