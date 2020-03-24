const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const db = require('./../db');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const Email = require('./../utils/email');
const crypto = require('crypto');
const moment = require('moment');
const {
  hashPassword,
  comparePasswords,
  changedPasswordAfter,
  createPasswordResetToken
} = require('./../utils/password');
const {
  insertUser,
  getUserWithEmail,
  getUserWithId,
  updateUserPassResetData,
  getUserByResetToken,
  resetPassword
} = require('../SQL/userQueries');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.user_id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const hashed = await hashPassword(req.body.password);

  const newUser = {
    name: req.body.name,
    email: req.body.email,
    password: hashed
  };

  const data = await db(insertUser(newUser));
  createSendToken({ user_id: data.insertId, ...newUser }, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  const data = await db(getUserWithEmail(email));
  // 2) Check if user exists && password is correct
  if (data.length === 0) {
    return next(new AppError('no user with this email', 401));
  }
  const user = data[0];

  if (!(await comparePasswords(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const data = await db(getUserWithId(decoded.id));
  if (data.length === 0) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  const user = data[0];
  // 4) Check if user changed password after the token was issued
  if (changedPasswordAfter(decoded.iat, user.password_changed_at)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = user;
  res.locals.user = user;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    token = req.cookies.jwt;
  }

  // 1) verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const data = await db(getUserWithId(decoded.id));

  if (
    !token ||
    !decoded ||
    data.length === 0 ||
    changedPasswordAfter(decoded.iat, data[0].password_changed_at)
  ) {
    res.status(200).json({
      status: 'success',
      isLogged: false
    });
  } else {
    // THERE IS A LOGGED IN USER
    res.status(200).json({
      status: 'success',
      isLogged: true
    });
  }
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const data = await db(getUserWithEmail(req.body.email));
  if (data.length === 0) {
    return next(new AppError('There is no user with email address.', 404));
  }
  let user = data[0];
  // 2) Generate the random reset token
  const {
    resetToken,
    password_reset_token,
    password_reset_expire
  } = createPasswordResetToken();
  // 3) save token reset data in db
  await db(
    updateUserPassResetData(
      user.user_id,
      password_reset_token,
      password_reset_expire
    )
  );
  // 4) Send it to user's email
  try {
    const resetURL = `${req.protocol}://127.0.0.1:3001/resetPassword/${resetToken}`;
    console.log(resetURL);
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    // await db(updateUserPassResetData(user.user_id, null, null));
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const data = await db(getUserByResetToken(hashedToken, Date.now()));
  const user = data[0];

  // 2) If token has not expired, and there is user, set the new password
  if (data.length === 0) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  // 3) hash ana Update password, changedPasswordAt property for the user
  const hashed = await hashPassword(req.body.password);
  await db(
    resetPassword(user.user_id, hashed, moment().format('YYYY-MM-DD h:mm:ss'))
  );
  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const data = await db(getUserWithId(req.user.user_id));
  const user = data[0];
  // 2) Check if POSTed current password is correct
  if (!(await comparePasswords(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  const hashed = await hashPassword(req.body.newPassword);
  await db(
    resetPassword(user.user_id, hashed, moment().format('YYYY-MM-DD h:mm:ss'))
  );

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});
