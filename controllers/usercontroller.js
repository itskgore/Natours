const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // cb is similar to next but it is not from express
//     cb(null, 'public/img/users'); // error if any then destination
//   },
//   filename: (req, file, cb) => {
//     //file = req.file
//     // user-idofuserhere-timestamp123123.ext    this will not cause multiple file names and uploads to crash app
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  // testing uploaded file is an image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
}); // destination to save the img if not mention then saved in memory

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  if (!req.file) {
    return next();
  }
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User); // passing no popOptions

exports.createUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined please use signup'
  });
};

// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined'
//   });
// };

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create Error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates Please use update my password',
        400
      )
    );
  }
  // 2) Update user doc

  // here we are filtering out all the fields which are not required
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) {
    console.log(req.file.filename);
    filteredBody.photo = req.file.filename;
  }
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    message: 'User deleted Successfully',
    data: null
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Only for admin
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
