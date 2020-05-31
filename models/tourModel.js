const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//Schema Creation of Tour [class]
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must more or less then 40 characters'],
      minlength: [10, 'A tour name must have more or less than 10 characters']
      // validate: [validator.isAlpha, 'Tour name must have only Alphabets']
    },
    slug: String,
    duration: { type: Number, required: [true, 'A tour must have a duration'] },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 // if we dont multi by 10 for 4.6666 it will give 5 but multi by 10 it will give 47 / 10 =4.7
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have max group number']
    },
    difficulty: {
      type: String,
      required: [true, 'It should have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium, difficult'
      }
    },
    ratingQuantity: { type: Number, default: 0 },
    priceDiscount: {
      type: Number,
      validate: {
        message: 'Discount {{VALUE}} should be less than price',
        validator: function(val) {
          //This will not work in update only use it while creating a new doc
          return val < this.price;
        }
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour must have a summery']
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'Tour must have a cover image']
    },
    images: [{ type: String }],
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    secreteTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
        required: [true, 'Tour must have a type']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
  },
  {
    // TO display virtual properties in response
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// tourSchema.index({ price: 1 });
//INDEX
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); // for geopspatial be use such type of index if dealing with real co-ordinates
//Schema Creation End TOUR

//Virtual Properties
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7; //This will give us total weeks
});

// Virtual Population
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});
//Virtual Properties End

//Document Middleware (Runs before before save cmd and create cmd not on insertMany)
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(id => User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
// });

// tourSchema.pre('save', function(next) {
//   console.log(`Will Save doc...${this}`);
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });
//Document Middleware End

//Query Middleware End
tourSchema.pre(/^find/, function(next) {
  this.find({ secreteTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(doc, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedTimeAt'
  });
  next();
});
//Query Middleware End

//Aggregation Middleware
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({
//     $match: { secreteTour: { $ne: true } }
//   });
//   console.log(this);
//   next();
// });
//Aggregation Middleware End

//Model Creation of Tour [class name]
const Tour = mongoose.model('Tour', tourSchema);
//Model Creation End Tour

module.exports = Tour;
