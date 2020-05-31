const dotenv = require('dotenv');
// Uncaught Exception
process.on('uncaughtException', err => {
  // console.log(err.name, err.message);
  // console.log('Uncaught Exception.... Shutting down...');
  process.exit(1); //0 =success 1= un caught exception
});
// Uncaught Exception END
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// mongoose.connect(process.env.DATABASE_LOCAL...
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection done!');
  });

//Creating a DOc of Tour [object]
// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 997
// });
//Creating a DOc end Tour

const app = require('./index');
// console.log(app.get('env'));
// console.log(process.env);

// Server starting
const port = process.env.PORT;
const server = app.listen(port, () => {
  // console.log(`running on port ${port}....`);
});

//Unhandled Rejection
process.on('unhandledRejection', err => {
  // console.log(err.name, err.message);
  // console.log('Unhandled Rejection.... Shutting down...');
  server.close(() => {
    process.exit(1); //0 =success 1= un caught exception
  });
});
//Unhandled Rejection End
