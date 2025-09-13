import * as fs from 'fs';
import * as path from 'path';
import * as ini from 'ini';
import { AppConfig } from '../types';

export class ConfigManager {
  private static instance: ConfigManager;
  private configPath: string;
  private config!: AppConfig;

  private constructor() {
    this.configPath = path.join(process.cwd(), 'config.ini');
    this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const configFile = fs.readFileSync(this.configPath, 'utf-8');
        const parsedConfig = ini.parse(configFile);
        
        this.config = {
          Producao: {
            BD_Servidor: parsedConfig.Producao?.BD_Servidor || 'telmo-hp/3052',
            BD_Path: parsedConfig.Producao?.BD_Path || 'd:\\Clientes\\manodi\\GesProducao\\Base de Dados\\Manodi_Gesprod_v25.fdb',
            BD_Username: parsedConfig.Producao?.BD_Username || 'SYSDBA',
            BD_Password: parsedConfig.Producao?.BD_Password || 'eampdpg'
          },
          Gescom: {
            BD2_Servidor: parsedConfig.Gescom?.BD2_Servidor || 'telmo-hp/3052',
            BD2_Path: parsedConfig.Gescom?.BD2_Path || 'D:\\Clientes\\manodi\\Gescom\\Dados\\Manodi_v25.Fdb',
            BD2_Username: parsedConfig.Gescom?.BD2_Username || 'SYSDBA',
            BD2_Password: parsedConfig.Gescom?.BD2_Password || 'eampdpg'
          }
        };
      } else {
        this.createDefaultConfig();
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      this.createDefaultConfig();
    }
  }

  private createDefaultConfig(): void {
    this.config = {
      Producao: {
        BD_Servidor: 'telmo-hp/3052',
        BD_Path: 'd:\\Clientes\\manodi\\GesProducao\\Base de Dados\\Manodi_Gesprod_v25.fdb',
        BD_Username: 'SYSDBA',
        BD_Password: 'eampdpg'
      },
      Gescom: {
        BD2_Servidor: 'telmo-hp/3052',
        BD2_Path: 'D:\\Clientes\\manodi\\Gescom\\Dados\\Manodi_v25.Fdb',
        BD2_Username: 'SYSDBA',
        BD2_Password: 'eampdpg'
      }
    };
    this.saveConfig();
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<AppConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
    this.saveConfig();
  }

  private saveConfig(): void {
    try {
      const configString = ini.stringify({
        Producao: this.config.Producao,
        Gescom: this.config.Gescom
      });
      fs.writeFileSync(this.configPath, configString);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      throw error;
    }
  }

  public reloadConfig(): void {
    this.loadConfig();
  }

  public getRawIniContent(): string {
    try {
      if (fs.existsSync(this.configPath)) {
        return fs.readFileSync(this.configPath, 'utf-8');
      }
      return '';
    } catch (error) {
      console.error('Erro ao ler arquivo INI:', error);
      return '';
    }
  }

  public saveRawIniContent(content: string): void {
    try {
      fs.writeFileSync(this.configPath, content);
      this.reloadConfig(); // Recarregar a configuração após salvar
    } catch (error) {
      console.error('Erro ao salvar arquivo INI:', error);
      throw error;
    }
  }

  public getConfigPath(): string {
    return this.configPath;
  }
}