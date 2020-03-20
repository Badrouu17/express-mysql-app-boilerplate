const mysql = require('mysql');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'batn-db'
});

db.connect(err => {
  if (err) {
    console.error('DB error connecting: ' + err.stack);
    return;
  }
  console.log('DB connected !! as id ' + db.threadId);
});

module.exports = db;
