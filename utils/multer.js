const AppError = require('./appError');
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const multerUploads = multer({ storage, fileFilter: multerFilter }).single(
  'image'
);

const Datauri = require('datauri');
const dUri = new Datauri();

const dataUri = (originalname, buffer) =>
  dUri.format(path.extname(originalname).toString(), buffer);

module.exports = { multerUploads, dataUri };
