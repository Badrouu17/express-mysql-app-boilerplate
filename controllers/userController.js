const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const db = require('./../db');
const {
  deleteUser,
  updateUserName,
  updateUserEmail,
  updateUserPhoto
} = require('./../SQL/userQueries');

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user in db

  if (filteredBody.name)
    await db(updateUserName(req.user.user_id, filteredBody.name));
  if (filteredBody.email)
    await db(updateUserEmail(req.user.user_id, filteredBody.email));
  if (filteredBody.photo)
    await db(updateUserPhoto(req.user.user_id, filteredBody.photo));

  res.status(200).json({
    status: 'success'
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await db(deleteUser(req.user.user_id));

  res.status(204).json({
    status: 'success',
    data: null
  });
});
