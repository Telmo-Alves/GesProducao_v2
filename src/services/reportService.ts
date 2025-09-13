import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import moment from 'moment';
import { promises as fs } from 'fs';
import path from 'path';
import { MovRecepcao } from '../types/recepcao';
import { DatabaseConnection } from '../config/database';
import { ConfigManager } from '../config/config';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  styles: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportData {
  title: string;
  subtitle?: string;
  date: string;
  user: string;
  data: any[];
  totals?: Record<string, number>;
  filters?: Record<string, any>;
}

export class ReportService {
  private templatesPath: string;
  private dbConnection: DatabaseConnection;
  private activePath: string;

  constructor() {
    this.templatesPath = path.join(__dirname, '../templates/reports');
    this.activePath = path.join(this.templatesPath, '_active.json');
    this.ensureTemplatesDirectory();
    this.registerHandlebarsHelpers();
    const config = ConfigManager.getInstance().getConfig();
    this.dbConnection = DatabaseConnection.getInstance(config);
  }

  private async ensureTemplatesDirectory() {
    try {
      await fs.access(this.templatesPath);
    } catch {
      await fs.mkdir(this.templatesPath, { recursive: true });
      await this.createDefaultTemplates();
    }
  }

  async getActiveTemplateId(type: 'recepcoes' | 'fa'): Promise<string> {
    try {
      const raw = await fs.readFile(this.activePath, 'utf-8');
      const obj = JSON.parse(raw) as { recepcoes?: string; fa?: string };
      if (type === 'recepcoes') return obj.recepcoes || 'recepcoes-default';
      return obj.fa || 'fa-default';
    } catch {
      return type === 'recepcoes' ? 'recepcoes-default' : 'fa-default';
    }
  }

  async setActiveTemplateId(type: 'recepcoes' | 'fa', templateId: string): Promise<void> {
    try {
      let obj: any = {};
      try {
        const raw = await fs.readFile(this.activePath, 'utf-8');
        obj = JSON.parse(raw);
      } catch { obj = {}; }
      obj[type] = templateId;
      await fs.writeFile(this.activePath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      throw e;
    }
  }

  async generateFAPDF(seccao: number, numero: number, templateId?: string): Promise<Buffer> {
    const tplId = templateId || await this.getActiveTemplateId('fa');
    const template = await this.getTemplate(tplId);

    // Header
    const headerQuery = `SELECT FA_SECCAO, FA_NUMERO, FA_DATA, ROLOS, PESOS, ESTADO FROM FA_ENTRADA WHERE FA_SECCAO = ? AND FA_NUMERO = ? ROWS 1`;
    const headerRes = await this.dbConnection.executeQuery('producao', headerQuery, [seccao, numero]);
    if (!headerRes || headerRes.length === 0) throw new Error('Ficha não encontrada');
    const h = headerRes[0];

    // Items com join a MOV_RECEPCAO
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
    const rows = await this.dbConnection.executeQuery('producao', itemsQuery, [seccao, numero]);

    const items = rows.map((r: any) => ({
      data: new Date(r.MOV_REC_DATA),
      linha: r.MOV_REC_LINHA,
      nome: (r.NOME || '').trim(),
      codigo: r.CODIGO,
      descricao: (r.DESCRICAO || '').trim(),
      composicao: (r.COMPOSICAO_DESCRICAO || '').trim(),
      rolos: r.MOV_REC_ROLOS,
      pesos: r.MOV_REC_PESOS,
      cliente: r.CLIENTE,
    }));

    const totals = items.reduce((acc, it) => {
      acc.rolos += it.rolos || 0;
      acc.pesos += it.pesos || 0;
      return acc;
    }, { rolos: 0, pesos: 0 });

    const reportData: any = {
      title: 'Ficha de Acabamento',
      subtitle: 'Tinturaria - Gestão de Produção',
      date: moment().format('DD/MM/YYYY HH:mm'),
      user: 'Sistema',
      fa: {
        seccao: h.FA_SECCAO,
        numero: h.FA_NUMERO,
        data: h.FA_DATA,
        rolos: h.ROLOS,
        pesos: h.PESOS,
        estado: h.ESTADO,
      },
      items,
      totals,
    };

    const compiledTemplate = handlebars.compile(template.template);
    const html = compiledTemplate(reportData);

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${reportData.title}</title>
          <style>
            ${template.styles}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4', margin: { top:'12mm', right:'10mm', bottom:'12mm', left:'10mm' }, printBackground: true });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
  private registerHandlebarsHelpers() {
    // Helper para formatação de datas
    handlebars.registerHelper('formatDate', (date: Date) => {
      return moment(date).format('DD/MM/YYYY');
    });

    // Helper para formatação de números
    handlebars.registerHelper('formatNumber', (number: number, decimals = 2) => {
      return Number(number).toLocaleString('pt-PT', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    });

    // Helper para cálculos
    handlebars.registerHelper('subtract', (a: number, b: number) => {
      return a - b;
    });

    // Helper para condicionais
    handlebars.registerHelper('eq', (a: any, b: any) => {
      return a === b;
    });

    // Helper para iteração com index
    handlebars.registerHelper('eachWithIndex', function(array: any[], options: any) {
      let result = '';
      for (let i = 0; i < array.length; i++) {
        result += options.fn({ ...array[i], index: i + 1 });
      }
      return result;
    });
  }

  async generateRecepcoesPDF(recepcoes: MovRecepcao[], filters?: any, templateId = 'recepcoes-default'): Promise<Buffer> {
    const tplId = templateId || await this.getActiveTemplateId('recepcoes');
    const template = await this.getTemplate(tplId);
    
    // Calcular totais
    const totais = recepcoes.reduce((acc, recepcao) => {
      acc.rolosPendentes += (recepcao.rolos - recepcao.rolos_entregues);
      acc.pesosPendentes += (recepcao.pesos - recepcao.pesos_entregues);
      acc.rolosTotal += recepcao.rolos;
      acc.pesosTotal += recepcao.pesos;
      return acc;
    }, {
      rolosPendentes: 0,
      pesosPendentes: 0,
      rolosTotal: 0,
      pesosTotal: 0
    });

    const reportData: ReportData = {
      title: 'Relatório de Recepções Pendentes',
      subtitle: 'Tinturaria - Gestão de Produção',
      date: moment().format('DD/MM/YYYY HH:mm'),
      user: 'Sistema',
      data: recepcoes,
      totals: totais,
      filters
    };

    const compiledTemplate = handlebars.compile(template.template);
    const html = compiledTemplate(reportData);

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${reportData.title}</title>
          <style>
            ${template.styles}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async getTemplate(templateId: string): Promise<ReportTemplate> {
    const templatePath = path.join(this.templatesPath, `${templateId}.json`);
    
    try {
      const templateData = await fs.readFile(templatePath, 'utf-8');
      return JSON.parse(templateData);
    } catch {
      // Se não encontrar, usar template padrão
      return this.getDefaultRecepcaoTemplate();
    }
  }

  async saveTemplate(template: ReportTemplate): Promise<void> {
    const templatePath = path.join(this.templatesPath, `${template.id}.json`);
    template.updatedAt = new Date();
    
    await fs.writeFile(templatePath, JSON.stringify(template, null, 2));
  }

  async listTemplates(): Promise<ReportTemplate[]> {
    try {
      const files = await fs.readdir(this.templatesPath);
      const templates: ReportTemplate[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const templateData = await fs.readFile(path.join(this.templatesPath, file), 'utf-8');
            templates.push(JSON.parse(templateData));
          } catch (error) {
            console.error(`Erro ao ler template ${file}:`, error);
          }
        }
      }

      return templates;
    } catch {
      return [this.getDefaultRecepcaoTemplate()];
    }
  }

  private async createDefaultTemplates(): Promise<void> {
    const defaultTemplate = this.getDefaultRecepcaoTemplate();
    await this.saveTemplate(defaultTemplate);
    const defaultFATemplate = this.getDefaultFATemplate();
    await this.saveTemplate(defaultFATemplate);
  }

  private getDefaultRecepcaoTemplate(): ReportTemplate {
    return {
      id: 'recepcoes-default',
      name: 'Recepções - Template Padrão',
      description: 'Template padrão para relatório de recepções pendentes',
      template: `
        <div class="header">
          <h1>{{title}}</h1>
          <h2>{{subtitle}}</h2>
          <div class="report-info">
            <span>Data: {{date}}</span>
            <span>Utilizador: {{user}}</span>
          </div>
        </div>

        {{#if filters}}
        <div class="filters">
          <h3>Filtros Aplicados:</h3>
          {{#if filters.nome}}<p>Cliente: {{filters.nome}}</p>{{/if}}
          {{#if filters.dataInicio}}<p>Data Início: {{formatDate filters.dataInicio}}</p>{{/if}}
          {{#if filters.dataFim}}<p>Data Fim: {{formatDate filters.dataFim}}</p>{{/if}}
        </div>
        {{/if}}

        <table class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Linha</th>
              <th>Cliente</th>
              <th>Artigo</th>
              <th>Rolos Pendentes</th>
              <th>Pesos Pendentes</th>
              <th>Processos</th>
            </tr>
          </thead>
          <tbody>
            {{#eachWithIndex data}}
            <tr>
              <td>{{formatDate this.data}}</td>
              <td>{{this.linha}}</td>
              <td>{{this.nome}}</td>
              <td>{{this.descricao}}</td>
              <td>{{subtract this.rolos this.rolos_entregues}} ({{this.rolos}} - {{this.rolos_entregues}})</td>
              <td>{{subtract this.pesos this.pesos_entregues}} ({{this.pesos}} - {{this.pesos_entregues}})</td>
              <td>
                {{#if (eq this.branquear 'S')}}B {{/if}}
                {{#if (eq this.desencolar 'S')}}D {{/if}}
                {{#if (eq this.tingir 'S')}}T {{/if}}
              </td>
            </tr>
            {{/eachWithIndex}}
          </tbody>
          <tfoot>
            <tr class="totals">
              <td colspan="4"><strong>TOTAIS:</strong></td>
              <td><strong>{{formatNumber totals.rolosPendentes 0}}</strong></td>
              <td><strong>{{formatNumber totals.pesosPendentes 2}}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div class="footer">
          <p>Total de registros: {{data.length}}</p>
          <p>Relatório gerado em {{date}}</p>
        </div>
      `,
      styles: `
        @page {
          size: A4;
          margin: 20mm 15mm;
        }

        body {
          font-family: Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: #333;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 15px;
        }

        .header h1 {
          font-size: 18pt;
          margin: 0 0 5px 0;
          color: #1e40af;
        }

        .header h2 {
          font-size: 14pt;
          margin: 0 0 10px 0;
          color: #64748b;
          font-weight: normal;
        }

        .report-info {
          display: flex;
          justify-content: space-between;
          font-size: 9pt;
          color: #64748b;
        }

        .filters {
          background: #f8fafc;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 20px;
          border-left: 4px solid #2563eb;
        }

        .filters h3 {
          margin: 0 0 10px 0;
          font-size: 11pt;
          color: #1e40af;
        }

        .filters p {
          margin: 2px 0;
          font-size: 9pt;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .data-table th {
          background: #2563eb;
          color: white;
          padding: 8px 6px;
          text-align: left;
          font-size: 9pt;
          font-weight: bold;
        }

        .data-table td {
          padding: 6px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 8pt;
        }

        .data-table tbody tr:nth-child(even) {
          background: #f8fafc;
        }

        .data-table .totals {
          background: #e2e8f0 !important;
          font-weight: bold;
        }

        .data-table .totals td {
          border-top: 2px solid #2563eb;
          padding: 8px 6px;
        }

        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 9pt;
          color: #64748b;
        }

        .footer p {
          margin: 2px 0;
        }
      `,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private getDefaultFATemplate(): ReportTemplate {
    return {
      id: 'fa-default',
      name: 'Ficha Acabamento - Padrão',
      description: 'Template padrão para Ficha de Acabamento',
      template: `
        <div class="header">
          <h1>{{title}}</h1>
          <h2>{{subtitle}}</h2>
          <div class="report-info">
            <span>Data: {{date}}</span>
            <span>Nº Ficha: {{fa.numero}}</span>
            <span>Seção: {{fa.seccao}}</span>
          </div>
        </div>

        <div class="filters">
          <p><strong>Ficha:</strong> Data: {{formatDate fa.data}} | Estado: {{fa.estado}} | Totais: Rolos {{fa.rolos}} / Kg {{fa.pesos}}</p>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Data</th>
              <th>Linha</th>
              <th>Cliente</th>
              <th>Artigo</th>
              <th>Composição</th>
              <th>Rolos</th>
              <th>Kg</th>
            </tr>
          </thead>
          <tbody>
            {{#eachWithIndex items}}
            <tr>
              <td>{{index}}</td>
              <td>{{formatDate this.data}}</td>
              <td>{{this.linha}}</td>
              <td>{{this.nome}}</td>
              <td>{{this.descricao}}</td>
              <td>{{this.composicao}}</td>
              <td>{{formatNumber this.rolos 0}}</td>
              <td>{{formatNumber this.pesos 2}}</td>
            </tr>
            {{/eachWithIndex}}
          </tbody>
          <tfoot>
            <tr class="totals">
              <td colspan="6"><strong>TOTAIS:</strong></td>
              <td><strong>{{formatNumber totals.rolos 0}}</strong></td>
              <td><strong>{{formatNumber totals.pesos 2}}</strong></td>
            </tr>
          </tfoot>
        </table>
      `,
      styles: `
        body { font-family: Arial, sans-serif; font-size: 10pt; color: #333 }
        .header { text-align:center; margin-bottom:16px; border-bottom: 2px solid #2563eb; padding-bottom:8px }
        .header h1 { font-size: 16pt; margin: 0; color:#1e40af }
        .header h2 { font-size: 12pt; margin: 4px 0 8px 0; color:#64748b; font-weight: normal }
        .report-info { display:flex; justify-content: space-between; font-size: 9pt; color:#64748b }
        .filters { background:#f8fafc; padding:8px; border-radius:5px; margin: 8px 0 14px 0; border-left: 4px solid #2563eb }
        .data-table { width:100%; border-collapse: collapse }
        .data-table th { background:#2563eb; color:#fff; text-align:left; padding:6px; font-size:9pt }
        .data-table td { padding:6px; border-bottom:1px solid #e2e8f0; font-size:9pt }
        .data-table tfoot td { font-weight:bold; border-top:2px solid #2563eb }
      `,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
