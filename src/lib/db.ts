import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const db = mysql.createPool({
  host: process.env.HOST_NAME || "localhost",
  port: 3306, // Ensure port is a number
  user: process.env.USERDB || "root",
  password: process.env.PASSWORDDB || "khadka",
  database: process.env.DATABASE || "intern",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // ✅ Increase timeout to 10s
});

// ✅ Test connection
db.getConnection()
  .then((conn) => {
    console.log("✅ Database connected successfully!");
    conn.release(); // Release connection after test
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
  });

export default db;
