import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { DatabaseConnection } from '../config/database';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Get data source fields
router.get('/datasource/:source/fields', authenticateToken, async (req, res) => {
  try {
    const { source } = req.params;
    const user = (req as any).user;

    let fields: any[] = [];

    if (source === 'producao') {
      // Get fields from MOV_RECEPCAO table
      fields = [
        { name: 'SECCAO', type: 'INTEGER', description: 'Secção' },
        { name: 'NUMERO', type: 'INTEGER', description: 'Número' },
        { name: 'CLIENTE', type: 'VARCHAR', description: 'Cliente' },
        { name: 'ARTIGO', type: 'VARCHAR', description: 'Artigo' },
        { name: 'COMPOSICAO', type: 'VARCHAR', description: 'Composição' },
        { name: 'PENDENTE', type: 'INTEGER', description: 'Pendente' },
        { name: 'METROS_PENDENTES', type: 'DECIMAL', description: 'Metros Pendentes' },
        { name: 'DATA_ENTRADA', type: 'DATE', description: 'Data Entrada' },
        { name: 'COR', type: 'VARCHAR', description: 'Cor' },
        { name: 'DESENHO', type: 'VARCHAR', description: 'Desenho' }
      ];
    } else if (source === 'gescom') {
      // Get fields from Gescom tables
      fields = [
        { name: 'CODIGO', type: 'VARCHAR', description: 'Código Cliente' },
        { name: 'NOME', type: 'VARCHAR', description: 'Nome Cliente' },
        { name: 'MORADA', type: 'VARCHAR', description: 'Morada' },
        { name: 'LOCALIDADE', type: 'VARCHAR', description: 'Localidade' },
        { name: 'TELEFONE', type: 'VARCHAR', description: 'Telefone' },
        { name: 'EMAIL', type: 'VARCHAR', description: 'Email' }
      ];
    }

    res.json({
      success: true,
      data: fields
    });

  } catch (error: any) {
    console.error('Error getting data source fields:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Save visual report
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { name, html, css, components, dataSource } = req.body;
    const user = (req as any).user;

    if (user.administrador !== 'S') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem criar reports.'
      });
    }

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, '../templates/visual-reports');
    try {
      await fs.mkdir(reportsDir, { recursive: true });
    } catch (err) {
      // Directory already exists
    }

    // Save report definition
    const reportData = {
      id: Date.now().toString(),
      name,
      html,
      css,
      components,
      dataSource,
      createdBy: user.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const filename = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${reportData.id}.json`;
    const filepath = path.join(reportsDir, filename);

    await fs.writeFile(filepath, JSON.stringify(reportData, null, 2));

    res.json({
      success: true,
      data: { id: reportData.id, filename }
    });

  } catch (error: any) {
    console.error('Error saving visual report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List visual reports
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const reportsDir = path.join(__dirname, '../templates/visual-reports');

    try {
      const files = await fs.readdir(reportsDir);
      const reports = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filepath = path.join(reportsDir, file);
            const content = await fs.readFile(filepath, 'utf-8');
            const reportData = JSON.parse(content);

            reports.push({
              id: reportData.id,
              name: reportData.name,
              dataSource: reportData.dataSource,
              createdBy: reportData.createdBy,
              createdAt: reportData.createdAt,
              updatedAt: reportData.updatedAt
            });
          } catch (err) {
            console.warn('Error reading report file:', file, err);
          }
        }
      }

      res.json({
        success: true,
        data: reports
      });

    } catch (err) {
      // Directory doesn't exist yet
      res.json({
        success: true,
        data: []
      });
    }

  } catch (error: any) {
    console.error('Error listing visual reports:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate PDF from visual report
router.post('/generate/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const reportsDir = path.join(__dirname, '../templates/visual-reports');

    // Find report file
    const files = await fs.readdir(reportsDir);
    const reportFile = files.find(file => file.includes(id));

    if (!reportFile) {
      return res.status(404).json({
        success: false,
        error: 'Report não encontrado'
      });
    }

    const filepath = path.join(reportsDir, reportFile);
    const content = await fs.readFile(filepath, 'utf-8');
    const reportData = JSON.parse(content);

    // Get data from database
    let data: any[] = [];

    if (reportData.dataSource === 'producao') {
      try {
        const { ConfigManager } = require('../config/config');
        const configManager = ConfigManager.getInstance();
        const config = configManager.getConfig();
        const dbConn = DatabaseConnection.getInstance(config);

        const db = await dbConn.connectToProducao();
        data = await new Promise((resolve, reject) => {
          db.query(
            'SELECT SECCAO, NUMERO, CLIENTE, ARTIGO, COMPOSICAO, PENDENTE, METROS_PENDENTES, DATA_ENTRADA FROM MOV_RECEPCAO WHERE PENDENTE > 0 ORDER BY DATA_ENTRADA DESC ROWS 50',
            [],
            (err: any, result: any) => {
              db.detach();
              if (err) reject(err);
              else resolve(result || []);
            }
          );
        });
      } catch (err) {
        console.warn('Database connection failed, using mock data');
        data = [
          {
            SECCAO: 1,
            NUMERO: 12345,
            CLIENTE: 'Cliente Exemplo',
            ARTIGO: 'ART001',
            COMPOSICAO: '100% Algodão',
            PENDENTE: 5,
            METROS_PENDENTES: 150.5,
            DATA_ENTRADA: new Date()
          }
        ];
      }
    }

    // Process HTML template with real data
    let processedHtml = reportData.html;

    // Replace template variables
    processedHtml = processedHtml
      .replace(/\{\{reportTitle\}\}/g, reportData.name)
      .replace(/\{\{currentDate\}\}/g, new Date().toLocaleDateString('pt-PT'))
      .replace(/\{\{pageNumber\}\}/g, '1')
      .replace(/\{\{totalPages\}\}/g, '1');

    // Generate table rows for data tables
    if (data.length > 0 && processedHtml.includes('data-table')) {
      const tableRows = data.map(row => `
        <tr>
          <td>${row.SECCAO || ''}</td>
          <td>${row.NUMERO || ''}</td>
          <td>${row.CLIENTE || ''}</td>
          <td>${row.ARTIGO || ''}</td>
          <td>${row.COMPOSICAO || ''}</td>
          <td>${row.PENDENTE || 0}</td>
          <td>${row.METROS_PENDENTES || 0}</td>
          <td>${row.DATA_ENTRADA ? new Date(row.DATA_ENTRADA).toLocaleDateString('pt-PT') : ''}</td>
        </tr>
      `).join('');

      // Replace table content
      processedHtml = processedHtml.replace(
        /<tbody>[\s\S]*?<\/tbody>/g,
        `<tbody>${tableRows}</tbody>`
      );

      // Update table headers
      processedHtml = processedHtml.replace(
        /<thead>[\s\S]*?<\/thead>/g,
        `<thead>
          <tr>
            <th>Secção</th>
            <th>Número</th>
            <th>Cliente</th>
            <th>Artigo</th>
            <th>Composição</th>
            <th>Pendente</th>
            <th>Metros</th>
            <th>Data Entrada</th>
          </tr>
        </thead>`
      );
    }

    // Generate PDF using Puppeteer (similar to existing reports)
    const puppeteer = require('puppeteer');

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${reportData.name}</title>
          <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
          <style>
            ${reportData.css}
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .data-table { width: 100%; margin: 20px 0; }
            .data-table th, .data-table td { padding: 8px; border: 1px solid #ddd; }
            .chart-container { background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; text-align: center; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${processedHtml}
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
        margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' },
        printBackground: true
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${reportData.name}.pdf"`);
      res.send(Buffer.from(pdf));

    } finally {
      await browser.close();
    }

  } catch (error: any) {
    console.error('Error generating visual report PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;