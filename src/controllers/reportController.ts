import { Request, Response } from 'express';
import { ReportService, ReportTemplate } from '../services/reportService';
import { RecepcaoService } from '../services/recepcaoService';
import { MovRecepcaoFilters } from '../types/recepcao';

interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string; role: string; seccao: number; isAdmin: boolean };
}

export class ReportController {
  private reportService: ReportService;
  private recepcaoService: RecepcaoService;

  constructor() {
    this.reportService = new ReportService();
    this.recepcaoService = new RecepcaoService();
  }

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
        limit: 1000 // Para relatórios, buscar todos os registros
      };

      // Filtrar por secção se não for admin
      if (!req.user?.isAdmin) {
        filters.seccao = req.user?.seccao || 1;
      }

      const templateId = req.query.template as string || 'recepcoes-default';
      
      const result = await this.recepcaoService.getAllRecepcoes(filters);
      const recepcoes = result.data;

      const pdfBuffer = await this.reportService.generateRecepcoesPDF(
        recepcoes, 
        filters, 
        templateId
      );

      const filename = `recepcoes_${new Date().toISOString().split('T')[0]}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Erro ao gerar relatório PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar relatório PDF'
      });
    }
  };

  previewRecepcoesPDF = async (req: AuthenticatedRequest, res: Response) => {
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

      // Filtrar por secção se não for admin
      if (!req.user?.isAdmin) {
        filters.seccao = req.user?.seccao || 1;
      }

      const templateId = req.query.template as string || 'recepcoes-default';
      
      const result = await this.recepcaoService.getAllRecepcoes(filters);
      const recepcoes = result.data;

      const pdfBuffer = await this.reportService.generateRecepcoesPDF(
        recepcoes, 
        filters, 
        templateId
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Erro ao gerar pré-visualização PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar pré-visualização PDF'
      });
    }
  };

  listTemplates = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const templates = await this.reportService.listTemplates();
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Erro ao listar templates:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar templates'
      });
    }
  };

  getTemplate = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { templateId } = req.params;
      const template = await this.reportService.getTemplate(templateId);
      
      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Erro ao buscar template:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar template'
      });
    }
  };

  saveTemplate = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const template: ReportTemplate = req.body;
      
      // Validações básicas
      if (!template.id || !template.name || !template.template) {
        return res.status(400).json({
          success: false,
          error: 'Dados do template inválidos'
        });
      }

      await this.reportService.saveTemplate(template);
      
      res.json({
        success: true,
        message: 'Template salvo com sucesso'
      });
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao salvar template'
      });
    }
  };

  createTemplate = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Nome do template é obrigatório'
        });
      }

      const template: ReportTemplate = {
        id: `recepcoes-${Date.now()}`,
        name,
        description: description || '',
        template: `
          <div class="header">
            <h1>{{title}}</h1>
            <h2>{{subtitle}}</h2>
          </div>
          
          <table class="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Artigo</th>
                <th>Rolos Pendentes</th>
                <th>Pesos Pendentes</th>
              </tr>
            </thead>
            <tbody>
              {{#eachWithIndex data}}
              <tr>
                <td>{{formatDate this.data}}</td>
                <td>{{this.nome}}</td>
                <td>{{this.descricao}}</td>
                <td>{{subtract this.rolos this.rolos_entregues}}</td>
                <td>{{subtract this.pesos this.pesos_entregues}}</td>
              </tr>
              {{/eachWithIndex}}
            </tbody>
          </table>
        `,
        styles: `
          body { font-family: Arial, sans-serif; }
          .header { text-align: center; margin-bottom: 20px; }
          .data-table { width: 100%; border-collapse: collapse; }
          .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; }
          .data-table th { background: #f5f5f5; }
        `,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.reportService.saveTemplate(template);
      
      res.json({
        success: true,
        data: template,
        message: 'Template criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar template:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar template'
      });
    }
  };
}