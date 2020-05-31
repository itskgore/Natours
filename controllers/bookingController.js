const stripe = require('stripe')(process.env.STRIPE_S_KEY);
const AppError = require('./../utils/AppError');
const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the current tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError('Tour does now exist!', 404));
  }
  //2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: `${req.user.email}`,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: `${tour.summary}`,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100, // amt expected in cents
        currency: 'usd',
        quantity: 1
      }
    ]
  });
  //allow us to send some data of the session we are
  //creating, after purchase was success we will get
  //access to current object again to create new booking
  //in db

  //3) Send session to client
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // THis is temporary and it is unsecured
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) {
    return next();
  }
  await Booking.create({ tour, user, price });
  // we can also use = `${req.protocol}://${req.get('host')}/ or just copy the url from browser
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBookings = factory.getOne(Booking, { path: 'tours' });
exports.getAllBookings = factory.getAll(Booking);
exports.updateBookings = factory.updateOne(Booking);
exports.deleteBookings = factory.deleteOne(Booking);
