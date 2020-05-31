class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    //2)Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`); // Never make spaces in reqular exp

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
    // console.log(JSON.parse(queryString));

    //{difficulty:'easy', duration:{$gte:5}}
    //{difficulty:'easy', duration:{gte:5}}
    // let query = Tour.find(JSON.parse(queryString));
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
      // in mongooes shell sort('price' 'ratingsAverage')
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
      //Getting all the data but excluding __v field
    }
    return this;
  }

  pagination() {
    //page=2&limit=10
    const page = this.queryString.page * 1 || 1; //Convert string to number || will help to assign default value
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // 1-10 = page 1, 11-20 = page 2, 21-30 = page 3
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
