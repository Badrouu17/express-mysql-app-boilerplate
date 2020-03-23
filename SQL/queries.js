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
  return SQL`SELECT user_id,name,email,photo,password,password_changed_at
  FROM users
  WHERE users.user_id = ${id}`;
};

exports.updateUserPassResetData = (id, prt, pre) => {
  return SQL`UPDATE users
  SET users.password_reset_token = ${prt} ,users.password_reset_expires = ${pre}
  WHERE users.user_id = ${id} 
  `;
};

exports.getUserByResetToken = (prt, now) => {
  return SQL`SELECT user_id,name,email,photo,password
  FROM users
  WHERE users.password_reset_token = ${prt}
  AND
  users.password_reset_expires > ${now} `;
};

exports.resetPassword = (id, pass, pca) => {
  return SQL`UPDATE users
  SET users.password = ${pass}, 
  users.password_reset_token = NULL, 
  users.password_reset_expires = NULL,
  users.password_changed_at = ${pca}
  WHERE users.user_id = ${id}`;
};
