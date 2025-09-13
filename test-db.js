const firebird = require('node-firebird');

const dbConfig = {
  host: 'telmo-hp',
  port: 3052,
  database: 'd:\\Clientes\\manodi\\GesProducao\\Base de Dados\\Manodi_Gesprod_v25.fdb',
  user: 'SYSDBA',
  password: 'eampdpg',
  lowercase_keys: false,
  role: null,
  pageSize: 4096
};

console.log('Trying to connect to database...');
console.log('Config:', { ...dbConfig, password: '***' });

firebird.attach(dbConfig, (err, db) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }

  console.log('✅ Database connected successfully!');

  // Test a simple query
  db.query('SELECT 1 FROM RDB$DATABASE', (err, result) => {
    if (err) {
      console.error('Query error:', err);
    } else {
      console.log('✅ Simple query works:', result);
    }

    // Test the procedure with sample values
    db.query('SELECT * FROM OBTER_FICHAS_ENTRADA(?, ?)', [1, 25349], (err, result) => {
      if (err) {
        console.error('❌ Procedure error:', err);
      } else {
        console.log('✅ Procedure works:', result);
      }

      db.detach();
      process.exit(0);
    });
  });
});