const { DatabaseConnection } = require('./dist/config/database');
const { ConfigManager } = require('./dist/config/config');

async function testRecepcaoQuery() {
  try {
    const config = ConfigManager.getInstance().getConfig();
    const dbConnection = DatabaseConnection.getInstance(config);
    
    console.log('🔍 Testando query de recepções...\n');
    
    // Query básica para ver todos os registros
    const allQuery = `SELECT COUNT(*) as TOTAL FROM MOV_RECEPCAO`;
    const allResult = await dbConnection.executeQuery('producao', allQuery);
    console.log(`Total de registros na tabela: ${allResult[0].TOTAL}`);
    
    // Query com filtro de rolos não entregues
    const filteredQuery = `
      SELECT COUNT(*) as TOTAL 
      FROM MOV_RECEPCAO 
      WHERE ROLOS_ENTREGUES < ROLOS
    `;
    const filteredResult = await dbConnection.executeQuery('producao', filteredQuery);
    console.log(`Registros não concluídos (ROLOS_ENTREGUES < ROLOS): ${filteredResult[0].TOTAL}`);
    
    // Query para ver alguns registros de exemplo
    const sampleQuery = `
      SELECT FIRST 5 SECCAO, DATA, LINHA, CLIENTE, NOME, ROLOS, ROLOS_ENTREGUES, PESOS, PESOS_ENTREGUES
      FROM MOV_RECEPCAO 
      ORDER BY DATA DESC, LINHA DESC
    `;
    const sampleResult = await dbConnection.executeQuery('producao', sampleQuery);
    
    console.log('\nÚltimos 5 registros:');
    console.log('==========================================');
    sampleResult.forEach((record, index) => {
      console.log(`${index + 1}. Secção: ${record.SECCAO}, Data: ${record.DATA}, Linha: ${record.LINHA}`);
      console.log(`   Cliente: ${record.CLIENTE} - ${record.NOME}`);
      console.log(`   Rolos: ${record.ROLOS}/${record.ROLOS_ENTREGUES}, Pesos: ${record.PESOS}/${record.PESOS_ENTREGUES}`);
      console.log('------------------------------------------');
    });
    
    // Testar query específica para secção 1
    const seccao1Query = `
      SELECT COUNT(*) as TOTAL 
      FROM MOV_RECEPCAO 
      WHERE SECCAO = 1 AND ROLOS_ENTREGUES < ROLOS
    `;
    const seccao1Result = await dbConnection.executeQuery('producao', seccao1Query);
    console.log(`\nRegistros não concluídos na secção 1: ${seccao1Result[0].TOTAL}`);
    
    // Ver registros por secção
    const seccaoQuery = `
      SELECT SECCAO, COUNT(*) as TOTAL 
      FROM MOV_RECEPCAO 
      GROUP BY SECCAO
      ORDER BY SECCAO
    `;
    const seccaoResult = await dbConnection.executeQuery('producao', seccaoQuery);
    
    console.log('\nRegistros por secção:');
    seccaoResult.forEach(sec => {
      console.log(`Secção ${sec.SECCAO}: ${sec.TOTAL} registros`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao testar query:', error);
  }
}

testRecepcaoQuery();