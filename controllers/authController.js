const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const db = require('./../db');
const jwt = require('jsonwebtoken');
const {
  hashPassword,
  comparePasswords,
  changedPasswordAfter
} = require('./../utils/password');
const crypto = require('crypto');
const { promisify } = require('util');
const {
  insertUser,
  getUserWithEmail,
  getUserWithId
} = require('./../SQL/queries');

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
    password: hashed.hashedPass
  };

  db.query(insertUser(newUser), (err, data) => {
    if (err) throw err;
    createSendToken({ user_id: data.insertId, ...newUser }, 201, req, res);
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  db.query(getUserWithEmail(email), async (err, data) => {
    if (err) throw error;
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
  db.query(getUserWithId(decoded.id), (err, data) => {
    if (err) throw err;
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
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = user;
    res.locals.user = user;
    next();
  });
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

  db.query(getUserWithId(decoded.id), (err, data) => {
    if (err) throw err;

    if (
      !token ||
      !decoded ||
      data.length === 0 ||
      currentUser.changedPasswordAfter(decoded.iat, data[0].password_changed_at)
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
  });
};
