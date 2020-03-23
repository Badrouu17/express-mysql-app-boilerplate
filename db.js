const { promisify } = require('util');
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
});

connection.connect(err => {
  if (err) {
    console.error('DB error connecting: ' + err.stack);
    return;
  }
  console.log('DB connected !! as id ' + db.threadId);
});

const db = promisify(connection.query).bind(connection);

module.exports = db;
