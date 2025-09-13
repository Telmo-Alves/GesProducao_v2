const { DatabaseConnection } = require('./dist/config/database');
const { ConfigManager } = require('./dist/config/config');

async function checkMovRecepcaoTable() {
  try {
    const config = ConfigManager.getInstance().getConfig();
    const dbConnection = DatabaseConnection.getInstance(config);
    
    console.log('📊 Analisando estrutura da tabela MOV_RECEPCAO...\n');
    
    // Query para obter estrutura da tabela no Firebird
    const structureQuery = `
      SELECT 
        r.RDB$FIELD_NAME as FIELD_NAME,
        f.RDB$FIELD_TYPE as FIELD_TYPE,
        f.RDB$FIELD_LENGTH as FIELD_LENGTH,
        f.RDB$FIELD_PRECISION as FIELD_PRECISION,
        f.RDB$FIELD_SCALE as FIELD_SCALE,
        r.RDB$NULL_FLAG as NULL_FLAG,
        r.RDB$DEFAULT_SOURCE as DEFAULT_VALUE,
        f.RDB$FIELD_SUB_TYPE as FIELD_SUB_TYPE
      FROM RDB$RELATION_FIELDS r
      LEFT JOIN RDB$FIELDS f ON r.RDB$FIELD_SOURCE = f.RDB$FIELD_NAME
      WHERE r.RDB$RELATION_NAME = 'MOV_RECEPCAO'
      ORDER BY r.RDB$FIELD_POSITION
    `;
    
    const structure = await dbConnection.executeQuery('producao', structureQuery);
    
    if (structure.length === 0) {
      console.log('❌ Tabela MOV_RECEPCAO não encontrada');
      return;
    }
    
    console.log(`✅ Tabela MOV_RECEPCAO encontrada com ${structure.length} campos:\n`);
    console.log('==========================================');
    
    structure.forEach((field, index) => {
      const fieldName = field.FIELD_NAME?.trim();
      const fieldType = getFirebirdTypeDescription(field.FIELD_TYPE, field.FIELD_SUB_TYPE, field.FIELD_LENGTH, field.FIELD_PRECISION, field.FIELD_SCALE);
      const isNullable = field.NULL_FLAG === null ? 'NULL' : 'NOT NULL';
      const defaultValue = field.DEFAULT_VALUE ? ` DEFAULT ${field.DEFAULT_VALUE}` : '';
      
      console.log(`${index + 1}. ${fieldName}`);
      console.log(`   Tipo: ${fieldType}`);
      console.log(`   Nullable: ${isNullable}${defaultValue}`);
      console.log('------------------------------------------');
    });
    
    // Tentar obter alguns registros de exemplo
    console.log('\n📋 Verificando registros existentes...\n');
    
    const dataQuery = `SELECT FIRST 5 * FROM MOV_RECEPCAO ORDER BY 1 DESC`;
    
    try {
      const sampleData = await dbConnection.executeQuery('producao', dataQuery);
      
      if (sampleData.length > 0) {
        console.log(`✅ Encontrados registros na tabela (mostrando os últimos 5):\n`);
        sampleData.forEach((record, index) => {
          console.log(`Registro ${index + 1}:`);
          Object.keys(record).forEach(key => {
            console.log(`  ${key}: ${record[key]}`);
          });
          console.log('------------------------------------------');
        });
      } else {
        console.log('⚠️ Tabela está vazia');
      }
    } catch (error) {
      console.log('⚠️ Erro ao buscar registros:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error.message);
  }
}

function getFirebirdTypeDescription(type, subtype, length, precision, scale) {
  switch (type) {
    case 7: return 'SMALLINT';
    case 8: return 'INTEGER';
    case 10: return 'FLOAT';
    case 12: return 'DATE';
    case 13: return 'TIME';
    case 14: return `VARCHAR(${length})`;
    case 16: return scale ? `NUMERIC(${precision},${Math.abs(scale)})` : 'BIGINT';
    case 27: return 'DOUBLE PRECISION';
    case 35: return 'TIMESTAMP';
    case 37: return `CHAR(${length})`;
    case 261: 
      if (subtype === 1) return 'TEXT BLOB';
      return 'BLOB';
    default: return `UNKNOWN(${type})`;
  }
}

checkMovRecepcaoTable();