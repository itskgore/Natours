const express = require('express');
const authenticateController = require('./../controllers/authenticationcontroller');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = express.Router({ mergeParams: true });
// NESTED ROUTES SIMPLE
// POST /tour/id11232/reviews
// GET /tour/id11232/reviews
// GET /tour/id11232/reviews/id1xz3123123

reviewRouter.use(authenticateController.protect);
// All below routes are protected
reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authenticateController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

reviewRouter
  .route('/:id')
  .delete(
    authenticateController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .get(reviewController.getOneReview)
  .patch(
    authenticateController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = reviewRouter;
