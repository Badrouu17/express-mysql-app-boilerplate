const SQL = require('sql-template-strings');

exports.insertUser = user => {
  const { name, email, password, password_changed_at } = user;
  return SQL`INSERT INTO users (name,email,password,password_changed_at)
  VALUES (${name},${email},${password},${password_changed_at})`;
};
