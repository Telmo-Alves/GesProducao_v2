import { Request, Response } from 'express';
import { RecepcaoService } from '../services/recepcaoService';
import { JasperReportService } from '../services/jasperReportService';
import { ConfigManager } from '../config/config';
import { DatabaseConnection } from '../config/database';
import { MovRecepcaoFilters } from '../types/recepcao';

interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string; role: string; seccao: number; isAdmin: boolean };
}

export class JasperReportController {
  private recepcaoService: RecepcaoService;
  private jasper: JasperReportService;

  constructor() {
    this.recepcaoService = new RecepcaoService();
    this.jasper = new JasperReportService();
  }

  // /reports/jasper/recepcoes/pdf?template=recepcoes
  generateRecepcoesPDF = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const filters: MovRecepcaoFilters = {
        seccao: req.query.seccao ? parseInt(req.query.seccao as string) : undefined,
        dataInicio: req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined,
        dataFim: req.query.dataFim ? new Date(req.query.dataFim as string) : undefined,
        cliente: req.query.cliente ? parseInt(req.query.cliente as string) : undefined,
        nome: req.query.nome as string,
        codigo: req.query.codigo ? parseInt(req.query.codigo as string) : undefined,
        composicao: req.query.composicao ? parseInt(req.query.composicao as string) : undefined,
        branquear: req.query.branquear as 'S' | 'N',
        desencolar: req.query.desencolar as 'S' | 'N',
        tingir: req.query.tingir as 'S' | 'N',
        utilizador: req.query.utilizador as string,
        requisicao: req.query.requisicao as string,
        page: 1,
        limit: 1000
      };

      if (!req.user?.isAdmin) {
        filters.seccao = req.user?.seccao || 1;
      }

      const template = (req.query.template as string) || 'recepcoes';
      const result = await this.recepcaoService.getAllRecepcoes(filters);

      // Provide JSON with a `data` array so Studio can use JSONQL root = data
      const dataPayload = {
        meta: {
          generatedAt: new Date().toISOString(),
          filters
        },
        data: result.data
      };

      const pdf = await this.jasper.renderPDF({
        report: template,
        params: {},
        dataSource: { type: 'json', data: dataPayload, jsonQuery: 'data' }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${template}.pdf"`);
      res.setHeader('Content-Length', pdf.length);
      res.send(pdf);
    } catch (error: any) {
      console.error('Erro Jasper/Recepções:', error);
      res.status(500).json({ success: false, error: error?.message || 'Erro ao gerar relatório Jasper' });
    }
  };

  // /reports/jasper/fa/:seccao/:numero?template=fa
  generateFAPDF = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const seccao = parseInt((req.params.seccao || req.query.seccao) as string);
      const numero = parseInt((req.params.numero || req.query.numero) as string);
      if (!seccao || !numero) {
        return res.status(400).json({ success: false, error: 'Parâmetros inválidos' });
      }

      const template = (req.query.template as string) || 'fa';

      // Query DB (reuse queries from HTML report service)
      const config = ConfigManager.getInstance().getConfig();
      const db = DatabaseConnection.getInstance(config);

      const headerQuery = `SELECT FA_SECCAO, FA_NUMERO, FA_DATA, ROLOS, PESOS, ESTADO FROM FA_ENTRADA WHERE FA_SECCAO = ? AND FA_NUMERO = ? ROWS 1`;
      const headerRes = await db.executeQuery('producao', headerQuery, [seccao, numero]);
      if (!headerRes || headerRes.length === 0) {
        return res.status(404).json({ success: false, error: 'Ficha não encontrada' });
      }
      const h: any = headerRes[0];

      const itemsQuery = `
        SELECT MR.FA_SECCAO, MR.FA_NUMERO, MR.LINHA,
               MR.MOV_REC_SECCAO, MR.MOV_REC_DATA, MR.MOV_REC_LINHA,
               MR.MOV_REC_ROLOS, MR.MOV_REC_PESOS,
               R.NOME, R.CODIGO, R.DESCRICAO, R.COMPOSICAO_DESCRICAO, R.CLIENTE
        FROM FA_MOV_RECEPCAO MR
        LEFT JOIN MOV_RECEPCAO R ON R.SECCAO = MR.MOV_REC_SECCAO AND R.DATA = MR.MOV_REC_DATA AND R.LINHA = MR.MOV_REC_LINHA
        WHERE MR.FA_SECCAO = ? AND MR.FA_NUMERO = ?
        ORDER BY MR.LINHA
      `;
      const rows: any[] = await db.executeQuery('producao', itemsQuery, [seccao, numero]);
      const items = rows.map((r: any) => ({
        data: r.MOV_REC_DATA,
        linha: r.MOV_REC_LINHA,
        nome: (r.NOME || '').trim(),
        codigo: r.CODIGO,
        descricao: (r.DESCRICAO || '').trim(),
        composicao: (r.COMPOSICAO_DESCRICAO || '').trim(),
        rolos: r.MOV_REC_ROLOS,
        pesos: r.MOV_REC_PESOS,
        cliente: r.CLIENTE,
      }));

      const totals = items.reduce((acc: { rolos: number; pesos: number }, it: any) => {
        acc.rolos += Number(it.rolos || 0);
        acc.pesos += Number(it.pesos || 0);
        return acc;
      }, { rolos: 0, pesos: 0 });

      const payload = { items };

      const pdf = await this.jasper.renderPDF({
        report: template,
        params: {
          fa_seccao: h.FA_SECCAO,
          fa_numero: h.FA_NUMERO,
          fa_data: h.FA_DATA,
          fa_rolos: h.ROLOS,
          fa_pesos: h.PESOS,
          fa_estado: h.ESTADO,
          total_rolos: totals.rolos,
          total_pesos: totals.pesos
        },
        dataSource: { type: 'json', data: payload, jsonQuery: 'items' }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=fa_${seccao}_${numero}.pdf`);
      res.send(pdf);
    } catch (error: any) {
      console.error('Erro Jasper/FA:', error);
      res.status(500).json({ success: false, error: error?.message || 'Erro ao gerar PDF da FA' });
    }
  };
}
