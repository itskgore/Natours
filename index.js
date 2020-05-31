const express = require('express');
const viewRouter = require('./routes/viewRouter');
const path = require('path');
const morgan = require('morgan');
const app = express();
const cookieParser = require('cookie-parser');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); //dir/views

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorcontroller');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
// 1 Global Middlewares

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Data Sanitization Against NoSQL query injections
app.use(mongoSanitize()); // looks at req.body, params, query and filter all the $ and dots

// Data Sanitization  Against XSS attack
app.use(xss()); // removes all malicious html code

//Security http headers
app.use(helmet());

// console.log(process.env.NODE_ENV);

// Prevent Parameter Population
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'ratingsAverage',
      'ratingQuantity',
      'maxGroupSize'
    ]
  })
);

// Development Logging
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

//  Body parser reading data from the body to req.body
app.use(express.json({ limit: '10kb' })); // only  kb data will be accepted
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb'
  })
);

//Cookie parser to parse cookie coming from req
app.use(cookieParser());

// Rate-Limit from a particular IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1hour
  message: 'Too many attempts from this IP please try again in an hour'
});
app.use('/api', limiter);

// app.use((req, res, next) => {
//   console.log('Hello from middleware');
//   next();
// });

// adding request time to our req
app.use((req, res, next) => {
  req.requesTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// app.get('/', (req, res) => {
//   //   res.status(200).send('Hello  from server');
//   res.status(200).json({ message: 'Hello from get method!', app: 'Testing' });
// });

// app.post('/', (req, res) => {
//   res.status(200).json({ message: 'Hello from post method!', app: 'Testing' });
// });

//Getting the tours

// 2 Middlewares Routes

// app.get('/api/v1/tours', getAlltours);

//Getting single data
// app.get('/api/v1/tours/:id', getTour);

// //Adding data to file
// // app.post('/api/v1/tours', createTour);

// //Updating a data
// app.patch('/api/v1/tours/:id', updateTour);

// // Deleting the tour
// app.delete('/api/v1/tours/:id', deleteTour);

// 3 Routes
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
// If the flow doesn't go in above to handlers it will go to the undefined url handler below
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); //Skips all the other middleware in stack and goes to error handling middleware directly
});

//Error handling middleware
app.use(globalErrorHandler);
module.exports = app;
//Error handling middleware End
