import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { FichasAcabamentoService } from '../services/fichasAcabamentoService';

export class FichasAcabamentoController {
  private service: FichasAcabamentoService;

  constructor() {
    this.service = new FichasAcabamentoService();
  }

  criar = async (req: Request, res: Response<ApiResponse>) => {
    try {
      const { seccao, data, estado, obs, itens } = req.body as {
        seccao: number;
        data?: string;
        estado?: number;
        obs?: string;
        itens: Array<{ movRecSeccao: number; movRecData: string; movRecLinha: number; rolos: number; pesos: number }>
      };

      if (!seccao || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ success: false, error: 'Dados inválidos' });
      }

      const dataFA = data ? new Date(data) : new Date();
      const totalRolos = itens.reduce((s, i) => s + (Number(i.rolos) || 0), 0);
      const totalPesos = itens.reduce((s, i) => s + (Number(i.pesos) || 0), 0);
      const mapped = itens.map(i => ({
        movRecSeccao: i.movRecSeccao,
        movRecData: new Date(i.movRecData),
        movRecLinha: i.movRecLinha,
        rolos: Number(i.rolos) || 0,
        pesos: Number(i.pesos) || 0,
      }));

      const result = await this.service.criarFichaEntrada(
        seccao,
        dataFA,
        totalRolos,
        totalPesos,
        estado ?? 1,
        obs ?? '',
        mapped
      );

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro ao criar ficha de acabamento:', error);
      res.status(500).json({ success: false, error: 'Erro ao criar ficha de acabamento' });
    }
  };
}

