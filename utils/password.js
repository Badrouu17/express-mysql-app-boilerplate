const bcrypt = require('bcryptjs');
const moment = require('moment');

exports.hashPassword = async password => {
  const hashedPass = await bcrypt.hash(password, 12);
  return {
    hashedPass,
    hashingTime: moment().format('YYYY-MM-DD h:mm:ss')
  };
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

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
