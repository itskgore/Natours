const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, 'Review can not be empty']
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'Review must belong to a tour']
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Review must belong to a user']
    }
  },
  {
    // TO display virtual properties in response
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//Index to avoid duplicate review of 1 tour from same user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name'
  // });
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

//Static methods
reviewSchema.statics.calAverageRatings = async function(tourId) {
  // 'this' points to the model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingQuantity: stats[0].numRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingQuantity: 0
    });
  }
};
reviewSchema.post('save', function() {
  // this points to current doc review
  //this.constructor points to the model
  this.constructor.calAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.rev = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function(next) {
  await this.rev.constructor.calAverageRatings(this.rev.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
