const fs = require('fs');
const path = require('path');
const ini = require('ini');
const Firebird = require('node-firebird');

function loadConfig() {
  const iniPath = path.join(process.cwd(), 'config.ini');
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

function query(db, q, params = []) {
  return new Promise((resolve, reject) => {
    db.query(q, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function mapType(fieldType, subType, scale) {
  // Basic mapping Firebird -> TypeScript
  switch (fieldType) {
    case 7: // SMALLINT
    case 8: // INTEGER
    case 16: // BIGINT / NUMERIC / DECIMAL
    case 27: // DOUBLE
    case 10: // FLOAT
    case 11: // D_FLOAT
      return 'number | null';
    case 12: // DATE
    case 14: // TIMESTAMP
      return 'Date | string | null';
    case 13: // TIME
      return 'string | null';
    case 37: // VARCHAR
    case 40: // CSTRING
    case 261: // BLOB
    default:
      return 'string | null';
  }
}

function toInterfaceName(table) {
  return table
    .toLowerCase()
    .split('_')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

(async () => {
  const cfg = loadConfig();
  const db = await attach(cfg);
  try {
    const tables = await query(
      db,
      "SELECT TRIM(RDB$RELATION_NAME) AS NAME FROM RDB$RELATIONS WHERE RDB$SYSTEM_FLAG = 0 AND RDB$VIEW_BLR IS NULL ORDER BY NAME"
    );

    let out = '// Auto-generated from Firebird metadata. Do not edit manually.\n\n';

    for (const t of tables) {
      const tableName = t.NAME.trim();
      const iface = toInterfaceName(tableName);
      const cols = await query(
        db,
        `SELECT TRIM(rf.RDB$FIELD_NAME) AS COL, f.RDB$FIELD_TYPE AS FTYPE, COALESCE(f.RDB$FIELD_SUB_TYPE, 0) AS FSUB, COALESCE(f.RDB$FIELD_SCALE, 0) AS FSCALE\n         FROM RDB$RELATION_FIELDS rf\n         JOIN RDB$FIELDS f ON rf.RDB$FIELD_SOURCE = f.RDB$FIELD_NAME\n         WHERE rf.RDB$RELATION_NAME = ?\n         ORDER BY rf.RDB$FIELD_POSITION`,
        [tableName]
      );

      out += `export interface ${iface} {\n`;
      cols.forEach(c => {
        const col = c.COL.trim();
        const tsType = mapType(c.FTYPE, c.FSUB, c.FSCALE);
        out += `  ${col}: ${tsType};\n`;
      });
      out += `}\n\n`;
    }

    const dest = path.join(process.cwd(), 'src', 'models', 'dbModels.ts');
    fs.writeFileSync(dest, out, 'utf-8');
    console.log('Generated models at', dest);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    db.detach();
  }
})();
