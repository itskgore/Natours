const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/usercontroller');
const authenticaltioncontroller = require('./../controllers/authenticationcontroller');
userRouter.post('/signup', authenticaltioncontroller.signup);
userRouter.post('/login', authenticaltioncontroller.login);
userRouter.get('/logout', authenticaltioncontroller.logout);
userRouter.post('/forgot-password', authenticaltioncontroller.forgotPassword);

// All the below routes are protected becoz the above one runs first
userRouter.use(authenticaltioncontroller.protect);
userRouter.patch(
  '/reset-password/:token',
  authenticaltioncontroller.resetPassword
);
userRouter.patch('/update-password', authenticaltioncontroller.updatePassword);
userRouter.patch(
  '/update-me',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
userRouter.delete('/delete-me', userController.deleteMe);

userRouter.get('/me', userController.getMe, userController.getUser);

//All the below routes can be used by admin only and login admins
userRouter.use(authenticaltioncontroller.restrictTo('admin'));
userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUsers);

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
