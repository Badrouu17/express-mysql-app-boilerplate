const SQL = require('sql-template-strings');

exports.insertUser = user => {
  const { name, email, password } = user;
  return SQL`INSERT INTO users (name,email,password)
  VALUES (${name},${email},${password})`;
};

exports.getUserWithEmail = email => {
  return SQL`SELECT user_id,name,email,photo,password
  FROM users
  WHERE users.email = ${email}`;
};

exports.getUserWithId = id => {
  return SQL`SELECT user_id,name,email,photo,password_changed_at
  FROM users
  WHERE users.user_id = ${id}`;
};
