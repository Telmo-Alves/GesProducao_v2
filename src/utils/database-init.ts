import { DatabaseConnection } from '../config/database';
import { ConfigManager } from '../config/config';

export async function initializeDatabase(): Promise<void> {
  try {
    const config = ConfigManager.getInstance().getConfig();
    const dbConnection = DatabaseConnection.getInstance(config);

    // Verificar se a tabela TAB_UTILIZADORES já existe
    const checkTableQuery = `
      SELECT COUNT(*) AS TABLE_COUNT 
      FROM RDB$RELATIONS 
      WHERE RDB$RELATION_NAME = 'TAB_UTILIZADORES'
    `;

    try {
      const result = await dbConnection.executeQuery('producao', checkTableQuery);
      if (result[0].TABLE_COUNT > 0) {
        console.log('Tabela TAB_UTILIZADORES já existe');
      } else {
        console.log('Tabela TAB_UTILIZADORES não encontrada. Pode ser necessário criá-la manualmente.');
      }
    } catch (error) {
      console.log('Verificação da tabela TAB_UTILIZADORES:', error);
    }

    console.log('Inicialização da base de dados concluída');
  } catch (error) {
    console.error('Erro na inicialização da base de dados:', error);
  }
}