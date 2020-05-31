const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authenticationController = require('./../controllers/authenticationcontroller');
const bookingRouter = express.Router({ mergeParams: true });

bookingRouter.use(authenticationController.protect);
bookingRouter.get(
  '/checkout-session/:tourId',

  bookingController.getCheckoutSession
);
bookingRouter.use(authenticationController.restrictTo('admin', 'lead-guide'));

bookingRouter
  .route('/')
  .post(bookingController.createBooking)
  .get(bookingController.getAllBookings);

bookingRouter
  .route('/:id')
  .get(bookingController.getBookings)
  .patch(bookingController.updateBookings)
  .delete(bookingController.deleteBookings);

module.exports = bookingRouter;
