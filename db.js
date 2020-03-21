const mysql = require('mysql');
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
});

db.connect(err => {
  if (err) {
    console.error('DB error connecting: ' + err.stack);
    return;
  }
  console.log('DB connected !! as id ' + db.threadId);
});

module.exports = db;
