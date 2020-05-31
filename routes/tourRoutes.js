const express = require('express');
const tourRouter = express.Router();
const tourController = require('../controllers/tourcontroller');
const authenticationController = require('./../controllers/authenticationcontroller');
const reviewRouter = require('./reviewRoutes');
// can also use this but now we can only use function name not the tourController and . operator
// const {getAlltours, getTour, updateTour, deleteTour, createTour} = requre('../controllers/tourcontroller.js');

// tourRouter.param('id', tourController.checkId);

// tourRouter
//   .route('/:tourId/reviews')
//   .post(
//     authenticationController.protect,
//     authenticationController.restrictTo('user'),
//     reviewController.createReview
//   );

tourRouter.use('/:tourId/review', reviewRouter);

tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(
    authenticationController.protect,
    authenticationController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);
tourRouter
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

tourRouter
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAlltours);

tourRouter
  .route('/')
  .get(tourController.getAlltours)
  // .post(tourController.checkBody, tourController.createTour);
  .post(
    authenticationController.protect,
    authenticationController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authenticationController.protect,
    authenticationController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authenticationController.protect,
    authenticationController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = tourRouter;
