import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "cafex",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  enableKeepAlive: true,
});

export async function checkDatabaseConnection() {
  const password = process.env.DB_PASSWORD ?? "";
  if (/^(ENTER_YOUR_|your_mysql_password|run_npm_run_db_setup)/i.test(password)) {
    const error = new Error(
      "Database credentials have not been configured. Run `npm run db:setup` in the backend folder.",
    );
    error.code = "DB_CONFIG_NOT_SET";
    throw error;
  }

  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}
