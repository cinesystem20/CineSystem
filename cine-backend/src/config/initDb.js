// src/config/initDb.js
// Se ejecuta al arrancar el servidor en producción para inicializar la BD si está vacía.
const fs   = require('fs');
const path = require('path');
const { pool } = require('./db');

const initDb = async () => {
  try {
    const conn = await pool.getConnection();

    // Verificar si la BD ya tiene tablas
    const [tables] = await conn.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'usuarios'"
    );

    if (tables[0].count > 0) {
      console.log('✅ Base de datos ya inicializada, omitiendo setup.');
      conn.release();
      return;
    }

    console.log('🔧 Inicializando base de datos...');

    const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');
    const seedPath   = path.join(__dirname, '..', '..', '..', 'database', 'seed.sql');

    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      // Ejecutar sentencias una por una (mysql2 no admite multi-statement en execute)
      const statements = splitSql(schema);
      for (const stmt of statements) {
        if (stmt.trim()) {
          await conn.query(stmt).catch(e => {
            // Ignorar errores de "ya existe"
            if (!e.message.includes('already exists') && !e.message.includes('Duplicate')) throw e;
          });
        }
      }
      console.log('✅ Schema creado.');
    }

    if (fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, 'utf8');
      const statements = splitSql(seed);
      for (const stmt of statements) {
        if (stmt.trim()) {
          await conn.query(stmt).catch(e => {
            if (!e.message.includes('Duplicate') && !e.message.includes('already exists')) throw e;
          });
        }
      }
      console.log('✅ Datos iniciales cargados.');
    }

    conn.release();
    console.log('🎬 Base de datos lista.');
  } catch (err) {
    console.error('❌ Error inicializando BD:', err.message);
    // No interrumpir el arranque del servidor
  }
};

/**
 * Divide un script SQL en sentencias individuales,
 * manejando los bloques DELIMITER $$ de los triggers.
 */
function splitSql(sql) {
  const results  = [];
  let delimiter  = ';';
  let current    = '';

  for (const line of sql.split('\n')) {
    const delimMatch = line.match(/^DELIMITER\s+(\S+)/i);
    if (delimMatch) {
      delimiter = delimMatch[1];
      continue;
    }

    current += line + '\n';

    if (current.trimEnd().endsWith(delimiter)) {
      // Quitar el delimitador final y guardar
      const stmt = current.trimEnd().slice(0, -delimiter.length).trim();
      if (stmt) results.push(stmt);
      current = '';
    }
  }

  if (current.trim()) results.push(current.trim());
  return results;
}

module.exports = { initDb };
