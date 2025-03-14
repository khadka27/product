import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.HOST_NAME,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined, // Convert to number
  user: process.env.USERDB,
  password: process.env.PASSWORDDB,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
