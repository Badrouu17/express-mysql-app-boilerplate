const bcrypt = require('bcryptjs');
const crypto = require('crypto');

exports.hashPassword = async password => {
  return await bcrypt.hash(password, 12);
};

exports.comparePasswords = async (newPassword, currentPassword) => {
  return await bcrypt.compare(newPassword, currentPassword);
};

exports.changedPasswordAfter = function(JWTTimestamp, passwordChangedAt) {
  if (passwordChangedAt) {
    const changedTimestamp = Date.parse(passwordChangedAt) / 1000;
    console.log({ JWTTimestamp, changedTimestamp });
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

exports.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  const password_reset_token = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  const password_reset_expire = Date.now() + 10 * 60 * 1000;

  return { resetToken, password_reset_token, password_reset_expire };
};
