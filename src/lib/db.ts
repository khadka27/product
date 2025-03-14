import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost", // change from "test" to "localhost"
  port: 3306, // specify the port if needed
  user: "root",
  password: "khadka",
  database: "intern",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
