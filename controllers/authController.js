const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const db = require('./../db');
const jwt = require('jsonwebtoken');
const { hashPassword } = require('./../utils/password');
const crypto = require('crypto');
const { promisify } = require('util');
const { insertUser } = require('./../SQL/queries');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.id);

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
    password: hashed.hashedPass,
    password_changed_at: hashed.hashingTime
  };

  db.query(insertUser(newUser), (err, data) => {
    if (err) throw err;
    createSendToken({ id: data.insertId, ...newUser }, 201, req, res);
  });
});
