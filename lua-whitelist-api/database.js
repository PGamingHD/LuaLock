const mysql = require("mysql2/promise");
var pool;
module.exports = function getPool() {
    if (pool) {
      return pool;
    }
    const config = {
        connectionLimit: 100,
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
        debug:false,
        waitForConnections: true,
        multipleStatements: true
    };
    return mysql.createPool({

        //DATABASE CREDENTIALS
    
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DATABASE,
    
        //DATABASE SETTINGS
    
        supportBigNumbers: true,
    });
};