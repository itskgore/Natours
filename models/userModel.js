const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email-id'],
    unique: [true, 'Email-id Already exists'],
    lowercase: true, //Transform the email to lowercase
    validate: [validator.isEmail, 'Please enter a valid email-id']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password should have at least 8 characters'],
    select: false //By this it will not be displayed the password in response this.password cannot be used
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //This only works on save and create!!
      validator: function(el) {
        //using simple function to get access to this keyword
        return el === this.password;
      },
      message: 'Password and Confirm-Password did not match'
    }
  },
  passwordChangedTimeAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

//PRE MIDDLEWARE
//Runs only on save / create functions

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedTimeAt = Date.now() - 2000;
  next();
});

userSchema.pre('save', async function(next) {
  //using simple function to get access to this keyword
  //only run this function if this password was modified
  if (!this.isModified('password')) {
    return next();
  }
  //hashing password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //deleting confirm password to avoid redundant data
  this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = async function(
  // this can be accessed by a User instance only not by User itself
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedTimeAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedTimeAt.getTime() / 1000,
      10
    );
    console.log(changedTimeStamp, JWTTimestamp);
    return JWTTimestamp < changedTimeStamp;
  }
  // False means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  resetToken = crypto.randomBytes(32).toString('hex'); //converting it to hexadecimal
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10m * 60sec * 1000 milliseconds
  console.log({ resetToken }, this.passwordResetToken);
  // Storing encrypted token in db for security reasons and sending plain token to user via email
  return resetToken;
};

userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
