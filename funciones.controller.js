// src/config/initDb.js
// Inicializa la BD la primera vez que arranca el servidor.
const fs    = require('fs');
const path  = require('path');
const mysql = require('mysql2/promise');

const initDb = async () => {
  // Conexión especial con multipleStatements para ejecutar triggers
  const conn = await mysql.createConnection({
    host:               process.env.MYSQLHOST     || process.env.DB_HOST     || 'localhost',
    port:               parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
    user:               process.env.MYSQLUSER     || process.env.DB_USER     || 'root',
    password:           process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database:           process.env.MYSQLDATABASE  || process.env.DB_NAME    || 'cinema_db',
    multipleStatements: true,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    // Verificar si ya está inicializada
    const [tables] = await conn.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'usuarios'"
    );

    if (tables[0].count > 0) {
      console.log('✅ Base de datos ya inicializada.');
      return;
    }

    console.log('🔧 Inicializando base de datos...');

    // database/ está en la raíz del proyecto (al mismo nivel que src/)
    const base       = path.join(__dirname, '..', '..', 'database');
    const schemaPath = path.join(base, 'schema.sql');
    const seedPath   = path.join(base, 'seed.sql');

    if (fs.existsSync(schemaPath)) {
      let schema = fs.readFileSync(schemaPath, 'utf8');
      schema = normalizeTriggers(schema);
      await conn.query(schema);
      console.log('✅ Schema creado.');
    } else {
      console.warn('⚠️  No se encontró database/schema.sql en:', base);
    }

    if (fs.existsSync(seedPath)) {
      let seed = fs.readFileSync(seedPath, 'utf8');
      seed = normalizeTriggers(seed);
      await conn.query(seed);
      console.log('✅ Datos iniciales cargados.');
    }

    console.log('🎬 Base de datos lista.');
  } catch (err) {
    console.error('❌ Error inicializando BD:', err.message);
  } finally {
    await conn.end();
  }
};

/**
 * Convierte DELIMITER $$ ... END$$ → END;
 * para que mysql2 con multipleStatements lo acepte.
 */
function normalizeTriggers(sql) {
  sql = sql.replace(/^DELIMITER\s+\S+\s*$/gim, '');
  sql = sql.replace(/END\s*\$\$/gi, 'END;');
  sql = sql.replace(/\n{3,}/g, '\n\n');
  return sql;
}

module.exports = { initDb };
