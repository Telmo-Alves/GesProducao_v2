import { ConfigManager } from '../config/config';
import { AppConfig } from '../types';

export class ConfigService {
  private configManager: ConfigManager;

  constructor() {
    this.configManager = ConfigManager.getInstance();
  }

  getConfig(): AppConfig {
    return this.configManager.getConfig();
  }

  updateConfig(newConfig: Partial<AppConfig>): void {
    this.configManager.updateConfig(newConfig);
  }

  testConnection(database: 'producao' | 'gescom'): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const { DatabaseConnection } = await import('../config/database');
        const dbConnection = DatabaseConnection.getInstance(this.configManager.getConfig());
        
        const testQuery = 'SELECT 1 FROM RDB$DATABASE';
        
        if (database === 'producao') {
          await dbConnection.executeQuery('producao', testQuery);
        } else {
          await dbConnection.executeQuery('gescom', testQuery);
        }
        
        resolve(true);
      } catch (error) {
        console.error(`Erro ao testar conexão ${database}:`, error);
        resolve(false);
      }
    });
  }

  async testAllConnections(): Promise<{ producao: boolean; gescom: boolean }> {
    const [producao, gescom] = await Promise.all([
      this.testConnection('producao'),
      this.testConnection('gescom')
    ]);

    return { producao, gescom };
  }

  reloadConfig(): void {
    this.configManager.reloadConfig();
  }

  getRawIniContent(): string {
    return this.configManager.getRawIniContent();
  }

  saveRawIniContent(content: string): void {
    this.configManager.saveRawIniContent(content);
  }

  getConfigPath(): string {
    return this.configManager.getConfigPath();
  }
}