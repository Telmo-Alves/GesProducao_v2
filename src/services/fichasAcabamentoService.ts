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

  async criarFichaEntrada(
    seccao: number,
    data: Date,
    totalRolos: number,
    totalPesos: number,
    estado: number,
    obs: string,
    itens: FichaAcabamentoItem[]
  ): Promise<{ faNumero: number; linhas: number }> {
    // 1) Criar ficha de entrada e obter número
    const queryFA = 'SELECT R_FA_NUMERO FROM Grava_Ficha_Entrada(?, ?, ?, ?, ?, ?)';
    const faRes = await this.dbConnection.executeQuery('producao', queryFA, [
      seccao,
      data,
      totalRolos,
      totalPesos,
      estado,
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

