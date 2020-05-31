const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const Bookings = require('./../models/bookingModel');
exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug: slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with than name', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} TOUR`,
    tour
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login into your account'
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
  if (!updatedUser) {
    return next(new AppError('User does not exist!!', 404));
  }
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find  all bookings
  const bookings = await Bookings.find({ user: req.user.id });
  if (!bookings) {
    return next(new AppError('User does not exist!!', 404));
  }

  // 2) Find tours with the returned IDs
  const tourIds = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } }); // this will select all the ids that are in _ids
  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});
