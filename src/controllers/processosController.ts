import { Request, Response } from 'express';
import { DatabaseConnection } from '../config/database';
import { ConfigManager } from '../config/config';

interface FichaEntradaResult {
  R_FA_SECCAO: number;
  R_FA_NUMERO: number;
  R_FA_DATA: string;
  R_ROLOS: number;
  R_PESOS: number;
  R_ROLOS_ENTREGUES: number;
  R_PESOS_ENTREGUES: number;
  R_GRAMAGEM: number;
  R_MEDIDAS: number;
  R_OBS: string;
  R_ESTADO: number;
  R_ESTADO_DESCRICAO: string;
  R_PRODUCAO: string;
  R_CLIENTE: number;
  R_CLIENTE_NOME: string;
  R_ARTIGO_CODIGO: number;
  R_ARTIGO_DESCRICAO: string;
  R_COMPOSICAO: number;
  R_COMPOSICAO_DESCRICAO: string;
  R_BRANQUEAR: string;
  R_DESENCOLAR: string;
  R_TINGIR: string;
  R_ID_COR: number;
  R_CODIGO_COR: string;
  R_REQUISICAO: string;
}

interface FichaProcessosResult {
  R_LINHA: number;
  R_DATA: string;
  R_PROCESSO_ID: number;
  R_PROCESSO: string;
  R_COR_ID: number;
  R_CODIGO_COR: string;
  R_COR_MALHA: string;
  R_ROLOS: number;
  R_PESOS: number;
  R_OBS: string;
}

export class ProcessosController {
  static async getFichaEntrada(req: Request, res: Response) {
    try {
      const { faNumero } = req.params;
      const userSeccao = (req as any).user?.seccao || 1;

      console.log('ProcessosController - getFichaEntrada:', { faNumero, userSeccao });

      if (!faNumero) {
        return res.status(400).json({
          success: false,
          message: 'Número FA é obrigatório'
        });
      }

      const config = ConfigManager.getInstance().getConfig();
      const db = DatabaseConnection.getInstance(config);

      const query = `
        SELECT * FROM OBTER_FICHAS_ENTRADA(?, ?)
      `;

      console.log('Executing query:', query, 'with params:', [userSeccao, parseInt(faNumero)]);

      const result = await db.executeQuery('producao', query, [userSeccao, parseInt(faNumero)]) as FichaEntradaResult[];

      console.log('Query result:', result);

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ficha não encontrada'
        });
      }

      const ficha = result[0];

      // Transform to lowercase for consistency with frontend
      const transformedFicha = {
        r_fa_seccao: ficha.R_FA_SECCAO,
        r_fa_numero: ficha.R_FA_NUMERO,
        r_fa_data: ficha.R_FA_DATA,
        r_rolos: ficha.R_ROLOS,
        r_pesos: ficha.R_PESOS,
        r_rolos_entregues: ficha.R_ROLOS_ENTREGUES,
        r_pesos_entregues: ficha.R_PESOS_ENTREGUES,
        r_gramagem: ficha.R_GRAMAGEM,
        r_medidas: ficha.R_MEDIDAS,
        r_obs: ficha.R_OBS,
        r_estado: ficha.R_ESTADO,
        r_estado_descricao: ficha.R_ESTADO_DESCRICAO,
        r_producao: ficha.R_PRODUCAO,
        r_cliente: ficha.R_CLIENTE,
        r_cliente_nome: ficha.R_CLIENTE_NOME,
        r_artigo_codigo: ficha.R_ARTIGO_CODIGO,
        r_artigo_descricao: ficha.R_ARTIGO_DESCRICAO,
        r_composicao: ficha.R_COMPOSICAO,
        r_composicao_descricao: ficha.R_COMPOSICAO_DESCRICAO,
        r_branquear: ficha.R_BRANQUEAR,
        r_desencolar: ficha.R_DESENCOLAR,
        r_tingir: ficha.R_TINGIR,
        r_id_cor: ficha.R_ID_COR,
        r_codigo_cor: ficha.R_CODIGO_COR,
        r_requisicao: ficha.R_REQUISICAO
      };

      return res.json({
        success: true,
        data: transformedFicha
      });

    } catch (error) {
      console.error('Erro ao obter ficha de entrada:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  static async getFichaProcessos(req: Request, res: Response) {
    try {
      const { faNumero } = req.params;
      const userSeccao = (req as any).user?.seccao || 1;

      console.log('ProcessosController - getFichaProcessos:', { faNumero, userSeccao });

      if (!faNumero) {
        return res.status(400).json({
          success: false,
          message: 'Número FA é obrigatório'
        });
      }

      const config = ConfigManager.getInstance().getConfig();
      const db = DatabaseConnection.getInstance(config);

      const query = `
        SELECT * FROM OBTER_FICHAS_PROCESSOS(?, ?)
      `;

      console.log('Executing processes query:', query, 'with params:', [userSeccao, parseInt(faNumero)]);

      const result = await db.executeQuery('producao', query, [userSeccao, parseInt(faNumero)]) as FichaProcessosResult[];

      console.log('Processes query result:', result);

      // Transform to lowercase for consistency with frontend
      const transformedProcessos = result.map(processo => ({
        r_linha: processo.R_LINHA,
        r_data: processo.R_DATA,
        r_processo_id: processo.R_PROCESSO_ID,
        r_processo: processo.R_PROCESSO,
        r_cor_id: processo.R_COR_ID,
        r_codigo_cor: processo.R_CODIGO_COR,
        r_cor_malha: processo.R_COR_MALHA,
        r_rolos: processo.R_ROLOS,
        r_pesos: processo.R_PESOS,
        r_obs: processo.R_OBS
      }));

      return res.json({
        success: true,
        data: transformedProcessos
      });

    } catch (error) {
      console.error('Erro ao obter processos da ficha:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  static async searchProcessos(req: Request, res: Response) {
    try {
      const config = ConfigManager.getInstance().getConfig();
      const db = DatabaseConnection.getInstance(config);

      const query = `
        Select TP.ID, TP.Descricao
        From Tab_Processos TP
          LEft Outer Join Situacoes S on S.Situacao = TP.Situacao
        Where S.Bloqueado = ?
        Order By TP.Ordem, TP.Descricao
      `;

      const result = await db.executeQuery('producao', query, ['N']);

      return res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Erro ao pesquisar processos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  static async searchCores(req: Request, res: Response) {
    try {
      const config = ConfigManager.getInstance().getConfig();
      const db = DatabaseConnection.getInstance(config);

      const query = `
        Select TC.ID, TC.Codigo_Cor, TC.Malha
        From Tab_Cores TC
          LEft Outer Join Situacoes S on S.Situacao = TC.Situacao
        Where S.Bloqueado = ?
        Order By TC.Codigo_Cor
      `;

      const result = await db.executeQuery('producao', query, ['N']);

      return res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Erro ao pesquisar cores:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  static async addProcesso(req: Request, res: Response) {
    try {
      const { faNumero } = req.params;
      const {
        processoId,
        corId,
        rolos,
        pesos,
        observacoes,
        gramagem,
        medidas
      } = req.body;
      const userSeccao = (req as any).user?.seccao || 1;

      console.log('ProcessosController - addProcesso:', {
        faNumero,
        userSeccao,
        processoId,
        corId,
        rolos,
        pesos,
        observacoes,
        gramagem,
        medidas
      });

      if (!faNumero || !processoId) {
        return res.status(400).json({
          success: false,
          message: 'Número FA e Processo são obrigatórios'
        });
      }

      const config = ConfigManager.getInstance().getConfig();
      const db = DatabaseConnection.getInstance(config);

      // Call stored procedure to add process record
      const query = `
        SELECT * FROM GRAVA_FA_PROCESSOS(?, ?, ?, 'NOW', ?, ?, ?, ?, ?)
      `;

      const params = [
        userSeccao,
        parseInt(faNumero),
        0, // E_Linha - deixar 0 para gerar automaticamente
        processoId,
        corId || null,
        parseFloat(rolos) || 0,
        parseFloat(pesos) || 0,
        observacoes || ''
      ];

      console.log('Executing insert query:', query, 'with params:', params);

      await db.executeQuery('producao', query, params);

      return res.json({
        success: true,
        message: 'Processo adicionado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao adicionar processo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  static async removeProcesso(req: Request, res: Response) {
    try {
      const { faNumero, linha } = req.params;
      const userSeccao = (req as any).user?.seccao || 1;

      console.log('ProcessosController - removeProcesso:', {
        faNumero,
        linha,
        userSeccao
      });

      if (!faNumero || !linha) {
        return res.status(400).json({
          success: false,
          message: 'Número FA e linha são obrigatórios'
        });
      }

      const config = ConfigManager.getInstance().getConfig();
      const db = DatabaseConnection.getInstance(config);

      // Delete the specific process line (matching Delphi code)
      const query = `
        DELETE FROM FA_PROCESSOS
        WHERE FA_SECCAO = ? AND FA_NUMERO = ? AND LINHA = ?
      `;

      const params = [
        userSeccao,
        parseInt(faNumero),
        parseInt(linha)
      ];

      console.log('Executing delete query:', query, 'with params:', params);

      await db.executeQuery('producao', query, params);

      return res.json({
        success: true,
        message: 'Processo removido com sucesso'
      });

    } catch (error) {
      console.error('Erro ao remover processo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  static async removeFichaEntrada(req: Request, res: Response) {
    try {
      const { faNumero } = req.params;
      const userSeccao = (req as any).user?.seccao || 1;

      console.log('ProcessosController - removeFichaEntrada:', {
        faNumero,
        userSeccao
      });

      if (!faNumero) {
        return res.status(400).json({
          success: false,
          message: 'Número FA é obrigatório'
        });
      }

      const config = ConfigManager.getInstance().getConfig();
      const db = DatabaseConnection.getInstance(config);

      // Delete the FA_Entrada record (matching Delphi code)
      const query = `
        DELETE FROM FA_ENTRADA
        WHERE FA_SECCAO = ? AND FA_NUMERO = ?
      `;

      const params = [
        userSeccao,
        parseInt(faNumero)
      ];

      console.log('Executing delete FA_Entrada query:', query, 'with params:', params);

      await db.executeQuery('producao', query, params);

      return res.json({
        success: true,
        message: 'Ficha de entrada removida com sucesso'
      });

    } catch (error) {
      console.error('Erro ao remover ficha de entrada:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  static async getUltimaFA(req: Request, res: Response) {
    try {
      const userSeccao = (req as any).user?.seccao || 1;

      console.log('ProcessosController - getUltimaFA:', { userSeccao });

      const config = ConfigManager.getInstance().getConfig();
      const db = DatabaseConnection.getInstance(config);

      const query = `
        SELECT MAX(FA_NUMERO) as ULTIMA_FA, MAX(FA_DATA) as ULTIMA_DATA FROM FA_ENTRADA WHERE FA_SECCAO = ?
      `;

      const result = await db.executeQuery('producao', query, [userSeccao]);

      console.log('Query result for ultima FA:', result);

      const ultimaFA = result && result.length > 0 ? result[0].ULTIMA_FA : null;
      const ultimaData = result && result.length > 0 ? result[0].ULTIMA_DATA : null;

      return res.json({
        success: true,
        data: {
          ultima_fa: ultimaFA,
          ultima_data: ultimaData
        }
      });

    } catch (error) {
      console.error('Erro ao obter última FA:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}