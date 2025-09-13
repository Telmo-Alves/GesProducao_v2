import { Request, Response } from 'express';
import { DatabaseConnection } from '../config/database';
import { ConfigManager } from '../config/config';

export class EntregasController {
  static async registarEntrega(req: Request, res: Response) {
    try {
      const { faNumero } = req.params;
      const {
        rolos,
        pesos,
        estadoId,
        observacoes
      } = req.body;
      const userSeccao = (req as any).user?.seccao || 1;

      console.log('EntregasController - registarEntrega:', {
        faNumero,
        userSeccao,
        rolos,
        pesos,
        estadoId,
        observacoes
      });

      if (!faNumero) {
        return res.status(400).json({
          success: false,
          message: 'Número FA é obrigatório'
        });
      }

      if (!pesos || !estadoId) {
        return res.status(400).json({
          success: false,
          message: 'Pesos e Estado são obrigatórios'
        });
      }

      const config = ConfigManager.getInstance().getConfig();
      const db = DatabaseConnection.getInstance(config);

      // Call stored procedure Grava_Mov_Entrega following Delphi pattern
      const query = `
        SELECT R_LINHA FROM GRAVA_MOV_ENTREGA(?, ?, 'NOW', ?, ?, ?, ?)
      `;

      const params = [
        userSeccao,                    // FA_Seccao
        parseInt(faNumero),            // FA_Numero
        parseFloat(rolos) || 0,        // Rolos
        parseFloat(pesos),             // Pesos
        parseInt(estadoId),            // Estado
        observacoes || ''              // Obs
      ];

      console.log('Executing Grava_Mov_Entrega query:', query, 'with params:', params);

      const result = await db.executeQuery('producao', query, params);

      console.log('Grava_Mov_Entrega result:', result);

      return res.json({
        success: true,
        message: 'Entrega registada com sucesso',
        data: result
      });

    } catch (error) {
      console.error('Erro ao registar entrega:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}