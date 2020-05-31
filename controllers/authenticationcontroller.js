const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const Email = require('./../utils/email');
const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  // secure: true, // only works for https
  httpOnly: true // cookie cannot be deleted form the client side
};
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  if (process.env.NODE_ENV == 'production') {
    cookieOptions.secure = true;
    // adding https access only in production mode
  }
  res.cookie('jwt', token, cookieOptions);
  //Removes the password
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: { user }
  });
};

const signToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm
  // });
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // 2) check if user exist && the password is correct
  const user = await User.findOne({ email: email }).select('+password'); // select is mention becoz password is false in model
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password', 401));
  }
  // 3) if everything is ok, send the token to client
  createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if its exist
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
      new AppError('You are not logged in! Please Login to get access', 401)
    );
  }

  // 2) Validate the token (No one manipulated the token)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) If token verified then check if user exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('User does not exist! Please create a new account')
    );
  }

  // 4) Check if changed password after the JWT token issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed the password please login again', 401)
    );
  }

  // 5) Grant Access to the User
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages , there would be no error
exports.isLoggedIn = async (req, res, next) => {
  // 1) Getting token and check if its exist
  let token;
  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;

      // 2) Verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3) If token verified then check if user exist
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 4) Check if changed password after the JWT token issued
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      }

      // 5) There is a logged in user
      res.locals.user = currentUser; // template will not access to user variable
      return next();
    } catch (err) {
      return next();
    }
  }
  return next(); // if no cookie
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is a array containing ['admin','lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      ); // 403 forbidden
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1)  Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(`There is no user with ${email} address`, 404));
  }

  // 2) Generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // to save the encrypted token and the expire token in db
  // validateBeforeSave will allow us to save data without providing the required doc in save method as
  // some of them are having required for there docs / fields and this will deactivate the validators

  // 3) Send it back as a Email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;
  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your Password Reset Token (Valid only for 10 mins',
    //   message: message
    // });
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (e) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email try again later!', 500)
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() }
  });
  if (!user) {
    return next(
      new AppError('Token expired / User does not exist Please try again!', 400)
    );
  }
  // 2) Set new password if token has not expiry and there is a user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpire = undefined;
  user.passwordResetToken = undefined;
  await user.save(); // not using validateBeforeSave: false becoz we want to validator to compare password and passwordConfirm

  // 3) Update changePassword property for current user

  // 4) Log the user in, send JWT token
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //  1) Get the current user
  const user = await User.findById(req.user.id).select('+password');

  // 2) If the password is current
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // 3) Update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate() we are not using it because the confirm password
  //  will not work it will not work on update only work on save and create
  // and also the pre middleware will not work

  // 4) Log user in by sending the JWT token
  createAndSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 5 * 1000), // 5 secs
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
};
