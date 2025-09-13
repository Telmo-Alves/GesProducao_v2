const fs = require('fs');
const ini = require('ini');
const Firebird = require('node-firebird');

function loadConfig() {
  const iniPath = process.cwd() + '/config.ini';
  const content = fs.readFileSync(iniPath, 'utf-8');
  const cfg = ini.parse(content);
  return {
    host: (cfg.Producao.BD_Servidor || 'localhost/3050').split('/')[0],
    port: parseInt((cfg.Producao.BD_Servidor || 'localhost/3050').split('/')[1] || '3050', 10),
    database: cfg.Producao.BD_Path,
    user: cfg.Producao.BD_Username,
    password: cfg.Producao.BD_Password,
  };
}

function attach(options) {
  return new Promise((resolve, reject) => {
    Firebird.attach({
      host: options.host,
      port: options.port,
      database: options.database,
      user: options.user,
      password: options.password,
      lowercase_keys: false,
      role: undefined,
      pageSize: 4096,
    }, (err, db) => {
      if (err) return reject(err);
      resolve(db);
    });
  });
}

async function query(db, q, params = []) {
  return new Promise((resolve, reject) => {
    db.query(q, params, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

(async () => {
  const cfg = loadConfig();
  console.log('Connecting to', cfg);
  const db = await attach(cfg);
  try {
    const tables = ['TAB_CLIENTES', 'TAB_ARTIGOS', 'TAB_COMPOSICOES'];
    for (const t of tables) {
      console.log(`\n== ${t} ==`);
      try {
        const cols = await query(db, `SELECT TRIM(RDB$FIELD_NAME) AS COL FROM RDB$RELATION_FIELDS WHERE RDB$RELATION_NAME = ? ORDER BY RDB$FIELD_POSITION`, [t]);
        console.log('Columns:', cols.map(r => r.COL.trim()));
      } catch (e) {
        console.log('Error reading columns:', e.message);
      }
      try {
        const rows = await query(db, `SELECT FIRST 5 * FROM ${t}`);
        console.log('Sample rows:', rows);
      } catch (e) {
        console.log('Error reading data:', e.message);
      }
    }
  } finally {
    db.detach();
  }
})().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});

