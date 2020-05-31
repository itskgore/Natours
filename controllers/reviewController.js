const Review = require('./../models/reviewModel');
// const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

//Now filter query also works on this like ?rating=4 etc
exports.getAllReviews = factory.getAll(Review);

exports.setTourUserIds = (req, res, next) => {
  //Allowing nested routes
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.use) {
    req.body.user = req.user.id;
  }
  next();
};
exports.getOneReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);
