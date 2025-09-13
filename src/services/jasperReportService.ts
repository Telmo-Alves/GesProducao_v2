import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

export type JasperDataSource =
  | { type: 'json'; data: any; jsonQuery?: string }
  | { type: 'none' };

export interface JasperOptions {
  // Report file name without extension. We look for `<name>.jasper` in templates dir
  report: string;
  // Parameters passed to the report
  params?: Record<string, string | number | boolean | null | undefined>;
  // Optional datasource. Recommend JSON to avoid JDBC dependencies.
  dataSource?: JasperDataSource;
}

export class JasperReportService {
  private jasperStarterBin: string;
  private templatesDir: string;

  constructor() {
    // Allow overriding via env var. Try common locations as fallbacks.
    const candidates = [
      process.env.JASPER_STARTER_BIN,
      '/usr/bin/jasperstarter',
      '/usr/local/bin/jasperstarter',
      '/opt/jasperstarter/bin/jasperstarter'
    ].filter(Boolean) as string[];

    this.jasperStarterBin = candidates[0]!;
    this.templatesDir = process.env.JASPER_TEMPLATES_DIR
      ? path.resolve(process.cwd(), process.env.JASPER_TEMPLATES_DIR)
      : path.resolve(process.cwd(), 'src/templates/jasper');
  }

  async renderPDF(opts: JasperOptions): Promise<Buffer> {
    await this.ensureBinaryExists();
    const reportFile = await this.resolveReportPath(opts.report);

    // Create temporary working directory for output and optional JSON input
    const tmpBase = await fs.mkdtemp(path.join(os.tmpdir(), 'jasper-'));
    const outDir = path.join(tmpBase, 'out');
    await fs.mkdir(outDir, { recursive: true });

    const args: string[] = ['process', reportFile, '-o', outDir, '-f', 'pdf', '--locale', 'pt_PT'];

    // Datasource handling (JSON recommended)
    let jsonFile: string | undefined;
    if (opts.dataSource && opts.dataSource.type === 'json') {
      jsonFile = path.join(tmpBase, 'data.json');
      await fs.writeFile(jsonFile, JSON.stringify(opts.dataSource.data ?? {}, null, 2), 'utf8');
      args.push('-t', 'json', '-i', jsonFile);
      if (opts.dataSource.jsonQuery) {
        args.push('--json-query', opts.dataSource.jsonQuery);
      }
    }

    // Parameters
    if (opts.params) {
      for (const [k, v] of Object.entries(opts.params)) {
        if (v === undefined) continue;
        args.push('-P');
        args.push(`${k}=${String(v)}`);
      }
    }

    await this.exec(this.jasperStarterBin, args);

    // jasperstarter writes `<basename>.pdf` in outDir
    const outPdf = path.join(outDir, `${path.basename(reportFile, path.extname(reportFile))}.pdf`);
    const pdf = await fs.readFile(outPdf);

    // Best-effort cleanup (ignore errors)
    try { await fs.rm(tmpBase, { recursive: true, force: true }); } catch {}
    return pdf;
  }

  private async resolveReportPath(name: string): Promise<string> {
    // Accept name with or without extension; prefer compiled .jasper, then .jrxml
    const base = path.join(this.templatesDir, 'compiled', name);
    const candidates = [ `${base}.jasper`, `${base}.jrxml`, path.join(this.templatesDir, `${name}.jasper`), path.join(this.templatesDir, `${name}.jrxml`) ];
    for (const p of candidates) {
      try {
        await fs.access(p);
        return p;
      } catch {}
    }
    throw new Error(`Relatório não encontrado: ${name}. Procure em ${this.templatesDir}`);
  }

  private async ensureBinaryExists(): Promise<void> {
    try {
      await fs.access(this.jasperStarterBin);
    } catch {
      const msg = `jasperstarter não encontrado em '${this.jasperStarterBin}'.
Para ativar JasperReports:
- Instale o JasperStarter (copie o bin para /usr/local/bin/jasperstarter) ou
- Defina JASPER_STARTER_BIN no .env apontando para o executável.
- Coloque os modelos em '${this.templatesDir}'.`;
      throw new Error(msg);
    }
  }

  private exec(cmd: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stderr = '';
      child.stderr.on('data', (d) => { stderr += d.toString(); });
      child.on('close', (code) => {
        if (code === 0) return resolve();
        reject(new Error(`Falha ao processar relatório. Código ${code}. STDERR: ${stderr}`));
      });
      child.on('error', (err) => reject(err));
    });
  }
}

