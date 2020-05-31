const fs = require('fs');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB connection done!');
  });

//Read json file
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//Import Data into db
const importData = async () => {
  try {
    const data = await Tour.create(tour);
    const user = await User.create(users, { validateBeforeSave: false });
    const review = await Review.create(reviews);
    console.log(`Data successfully loaded:`);
  } catch (e) {
    console.error(e);
  }
  process.exit();
};
//Import end

//Delete Data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log(`Data successfully deleted`);
  } catch (e) {
    console.error(e);
  }
  process.exit();
};

if (process.argv[2] == '--import') {
  importData();
} else if (process.argv[2] == '--delete') {
  deleteData();
}
// console.log(process.argv);
