const { DatabaseConnection } = require('./dist/config/database');
const { ConfigManager } = require('./dist/config/config');

async function testLookupQueries() {
  try {
    const config = ConfigManager.getInstance().getConfig();
    const dbConnection = DatabaseConnection.getInstance(config);
    
    console.log('🔍 Testando queries de lookup...\n');
    
    // Testar clientes
    console.log('=== CLIENTES ===');
    const clienteQuery = `
      SELECT DISTINCT CLIENTE as CODIGO, NOME 
      FROM MOV_RECEPCAO 
      ORDER BY NOME
    `;
    const clienteResult = await dbConnection.executeQuery('producao', clienteQuery);
    console.log(`Total de clientes: ${clienteResult.length}`);
    console.log('Primeiros 5 clientes:');
    clienteResult.slice(0, 5).forEach(cliente => {
      console.log(`  ${cliente.CODIGO} - ${cliente.NOME?.trim()}`);
    });
    
    // Testar artigos
    console.log('\n=== ARTIGOS ===');
    const artigoQuery = `
      SELECT DISTINCT CODIGO, DESCRICAO 
      FROM MOV_RECEPCAO 
      ORDER BY DESCRICAO
    `;
    const artigoResult = await dbConnection.executeQuery('producao', artigoQuery);
    console.log(`Total de artigos: ${artigoResult.length}`);
    console.log('Primeiros 5 artigos:');
    artigoResult.slice(0, 5).forEach(artigo => {
      console.log(`  ${artigo.CODIGO} - ${artigo.DESCRICAO?.trim()}`);
    });
    
    // Testar composições
    console.log('\n=== COMPOSIÇÕES ===');
    const composicaoQuery = `
      SELECT DISTINCT COMPOSICAO as CODIGO, COMPOSICAO_DESCRICAO as DESCRICAO 
      FROM MOV_RECEPCAO 
      ORDER BY COMPOSICAO_DESCRICAO
    `;
    const composicaoResult = await dbConnection.executeQuery('producao', composicaoQuery);
    console.log(`Total de composições: ${composicaoResult.length}`);
    console.log('Primeiras 5 composições:');
    composicaoResult.slice(0, 5).forEach(composicao => {
      console.log(`  ${composicao.CODIGO} - ${composicao.DESCRICAO?.trim()}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao testar lookup:', error);
  }
}

testLookupQueries();