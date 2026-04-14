// src/config/db.js — MySQL (compatible con Railway MySQL Plugin)
const mysql = require('mysql2/promise');

// Railway MySQL Plugin inyecta: MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
// También acepta DB_* para desarrollo local
const pool = mysql.createPool({
  host:               process.env.MYSQLHOST     || process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
  user:               process.env.MYSQLUSER     || process.env.DB_USER     || 'root',
  password:           process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database:           process.env.MYSQLDATABASE  || process.env.DB_NAME    || 'cinema_db',
  waitForConnections: true,
  connectionLimit:    20,
  queueLimit:         0,
  timezone:           '+00:00',
  decimalNumbers:     true,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined,
});



/**
 * Ejecuta una query y devuelve { rows, rowCount }
 * compatible con la interfaz que usábamos con pg
 */
const query = async (sql, params = []) => {
  // MySQL usa ? en lugar de $1, $2...
  // Convertimos $1,$2... → ? para compatibilidad
  const mysqlSql = sql.replace(/\$\d+/g, '?');
  const [rows, fields] = await pool.execute(mysqlSql, params);
  return {
    rows:     Array.isArray(rows) ? rows : [],
    rowCount: rows.affectedRows ?? rows.length ?? 0,
  };
};

/**
 * Obtiene una conexión del pool para transacciones manuales
 * Expone beginTransaction, commit, rollback, release
 */
const getClient = async () => {
  const conn = await pool.getConnection();

  // Wrapper para que conn.query sea compatible con pg
  const originalQuery = conn.execute.bind(conn);
  conn.query = async (sql, params = []) => {
    const mysqlSql = sql.replace(/\$\d+/g, '?');
    const [rows] = await originalQuery(mysqlSql, params);
    return {
      rows:     Array.isArray(rows) ? rows : [],
      rowCount: rows.affectedRows ?? rows.length ?? 0,
    };
  };

  conn.release = conn.release.bind(conn);
  return conn;
};

module.exports = { query, getClient, pool };
