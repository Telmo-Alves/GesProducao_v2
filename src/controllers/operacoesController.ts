import { Request, Response } from 'express';
import { DatabaseConnection } from '../config/database';
import { ConfigManager } from '../config/config';

// Helper functions to get data from database
async function getOperacaoDescricao(operacao: number): Promise<string> {
  try {
    const config = ConfigManager.getInstance().getConfig();
    const db = DatabaseConnection.getInstance(config);
    const query = 'SELECT DESCRICAO FROM TAB_OPERACOES WHERE OPERACAO = ?';
    const results = await db.executeQuery('producao', query, [operacao]);
    return results && results.length > 0 ? results[0].DESCRICAO : `Operação ${operacao}`;
  } catch (error) {
    return `Operação ${operacao}`;
  }
}

async function getMaquinaDescricao(maquina: number): Promise<string> {
  try {
    const config = ConfigManager.getInstance().getConfig();
    const db = DatabaseConnection.getInstance(config);
    const query = 'SELECT DESCRICAO FROM TAB_MAQUINAS WHERE MAQUINA = ?';
    const results = await db.executeQuery('producao', query, [maquina]);
    return results && results.length > 0 ? results[0].DESCRICAO : `Máquina ${maquina}`;
  } catch (error) {
    return `Máquina ${maquina}`;
  }
}

export class OperacoesController {

  static async getMaquinasStatus(req: Request, res: Response) {
    try {
      const config = ConfigManager.getInstance().getConfig();
      const db = DatabaseConnection.getInstance(config);

      // Execute OBTER_MAQUINAS_STATUS stored procedure based on Delphi code
      // Parameters: seccao, maquina, data
      const seccao = 1; // Default section
      const maquina = 0; // 0 = all machines
      const dataInicio = '01.01.2023'; // Start date

      const query = 'SELECT * FROM OBTER_MAQUINAS_STATUS(?, ?, ?)';

      console.log('Executing OBTER_MAQUINAS_STATUS with params:', [seccao, maquina, dataInicio]);

      const results = await db.executeQuery('producao', query, [seccao, maquina, dataInicio]);

      console.log('OBTER_MAQUINAS_STATUS result:', results);

      // Map the results to match the expected interface structure
      const mappedResults = (results || []).map((row: any) => ({
        r_maquina: row.R_MAQUINA,
        r_maquina_descricao: row.R_MAQUINA_DESCRICAO,
        r_data: row.R_DATA,
        r_operacao_descricao: row.R_OPERACAO_DESCRICAO,
        r_processo: row.R_PROCESSO,
        r_fa_numero: row.R_FA_NUMERO,
        r_rolos: row.R_ROLOS,
        r_pesos: row.R_PESOS,
        r_medidas: row.R_MEDIDAS,
        r_cliente_nome: row.R_CLIENTE_NOME,
        r_artigo_descricao: row.R_ARTIGO_DESCRICAO
      }));

      res.json({
        success: true,
        data: mappedResults
      });

    } catch (error) {
      console.error('Error in getMaquinasStatus:', error);

      res.status(500).json({
        success: false,
        error: 'Erro ao obter estado das máquinas',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async registrarLeitura(req: Request, res: Response) {
    try {
      const { codigoCompleto, terminal = 'WEB-LEITOR' } = req.body;

      if (!codigoCompleto) {
        return res.status(400).json({
          success: false,
          error: 'Código completo é obrigatório'
        });
      }

      // Parse do código: "operacao.codigo" ou "operacao.fa_numero.processo"
      const partes = codigoCompleto.split('.');

      if (partes.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Código de barras inválido'
        });
      }

      const operacao = parseInt(partes[0]);
      const restoCodigo = partes.slice(1).join('.');

      if (operacao <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Operação inválida'
        });
      }

      const config = ConfigManager.getInstance().getConfig();
      const db = DatabaseConnection.getInstance(config);

      let fa_numero = 0;
      let processo = 0;
      let maquina = 0;

      // op_SelecaoMaquina = 1 (baseado no código Delphi)
      if (operacao === 1) {
        // Seleção de máquina: "1.06"
        maquina = parseInt(restoCodigo);

        console.log('Seleção de máquina:', { operacao, maquina, terminal });

        // Call stored procedure for machine selection
        const query = 'SELECT * FROM Insert_Maq_Leituras(?, ?, ?, ?, ?)';
        const results = await db.executeQuery('producao', query, [operacao, terminal, 0, 0, maquina]);

        const nRegisto = results && results.length > 0 ? results[0].R_N_REGISTO : 0;
        const message = nRegisto > 0 ? `Gravação OK: ${nRegisto}` : `Erro OP: ${nRegisto}`;

        const operacaoDescricao = await getOperacaoDescricao(1);
        const maquinaDescricao = await getMaquinaDescricao(maquina);

        res.json({
          success: nRegisto > 0,
          message,
          operacao: operacaoDescricao,
          detalhes: {
            maquina: maquina,
            maquina_descricao: maquinaDescricao
          },
          data: results
        });

      } else {
        // Outras operações: "2.25352.12" (entrada/saída/etc)
        if (partes.length < 3) {
          return res.status(400).json({
            success: false,
            error: 'Código de processo inválido'
          });
        }

        fa_numero = parseInt(partes[1]);
        processo = parseInt(partes[2]);

        console.log('Operação processo:', { operacao, fa_numero, processo, terminal });

        // Call stored procedure for process operation
        const query = 'SELECT * FROM Insert_Maq_Leituras(?, ?, ?, ?, ?)';
        const results = await db.executeQuery('producao', query, [operacao, terminal, fa_numero, processo, 0]);

        const nRegisto = results && results.length > 0 ? results[0].R_N_REGISTO : 0;
        const message = nRegisto > 0 ? `Gravação OK: ${nRegisto}` : `Erro OP: ${nRegisto}`;

        const operacaoDescricao = await getOperacaoDescricao(operacao);

        res.json({
          success: nRegisto > 0,
          message,
          operacao: operacaoDescricao,
          detalhes: {
            fa_numero,
            processo
          },
          data: results
        });
      }

    } catch (error) {
      console.error('Error in registrarLeitura:', error);

      res.status(500).json({
        success: false,
        error: 'Erro ao registrar leitura',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async testConnection(req: Request, res: Response) {
    try {
      const config = ConfigManager.getInstance().getConfig();
      const db = DatabaseConnection.getInstance(config);

      // Simple connection test
      const query = 'SELECT 1 FROM RDB$DATABASE';
      const results = await db.executeQuery('producao', query, []);

      res.json({
        success: true,
        message: 'Conexão com base de dados OK',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in testConnection:', error);

      res.status(500).json({
        success: false,
        error: 'Erro de conexão com base de dados',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}