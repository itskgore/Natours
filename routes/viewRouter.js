const express = require('express');
const viewRouter = express.Router();
const authController = require('./../controllers/authenticationcontroller');
const viewController = require('./../controllers/viewController');
const userController = require('./../controllers/usercontroller');
const BookingController = require('./../controllers/bookingController');

viewRouter.get(
  '/',
  BookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
viewRouter.get(
  '/tour/:slug',
  authController.isLoggedIn,
  viewController.getTour
);
viewRouter.get('/login', authController.isLoggedIn, viewController.login);
viewRouter.get('/me', authController.protect, viewController.getAccount);
viewRouter.get('/my-tours', authController.protect, viewController.getMyTours);
viewRouter.patch(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);
module.exports = viewRouter;
