import mysql from 'mysql2/promise';

// Lazy-initialized pool to prevent crashing on startup if database environment variables are initially unset
let pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'skillsconnect_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000,
  });
} catch (error) {
  console.error('Failed to initialize database pool:', error);
}

// Helper query function that executes sql and returns rows
export async function query(sql, params) {
  try {
    if (!pool) {
      throw new Error('Database connection pool is not initialized');
    }
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database Query Error:', {
      sql,
      params,
      error: error.message,
    });
    throw error;
  }
}

export default pool;
