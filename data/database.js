const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: 'localhost',
    database: 'articles',
    user: 'root',
    password:'1111',
    port: 3111


  });

module.exports = pool