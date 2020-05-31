const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(`Document ${req.params.id} does not exist`, 404)
      );
    }
    res.status(204).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(new AppError(`Doc ${req.params.id} does not exist`, 404));
    }
    res.status(200).json({
      status: 'success',
      message: `${req.params.id} updated successfully`,
      data: {
        doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    // we are adding next here so that we can call the global error handler
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.getOne = (Model, popOtions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOtions) {
      query = query.populate(popOtions);
    }
    const doc = await query;
    if (!doc) {
      return next(new AppError(`Doc ${req.params.id} does not exist`, 404));
    }
    res.status(200).json({
      status: 'success',
      requestAt: `Requested at ${req.requesTime}`,
      data: { doc }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    //To allow for nested getReviews on Tour
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sorting()
      .limitFields()
      .pagination();
    // const doc = await features.query.explain(); //gives us the stats of that query results
    const doc = await features.query;
    //Send Response
    res.status(200).json({
      status: 'success',
      requestAt: `Requested at ${req.requesTime}`,
      result: doc.length,
      data: { doc }
    });
  });

//   exports.getAlltours = catchAsync(async (req, res, next) => {
//     // console.log(req.requesTime);
//     //Execute Query
//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sorting()
//       .limitFields()
//       .pagination();
//     const tours = await features.query;

//     //Send Response
//     res.status(200).json({
//       status: 'success',
//       requestAt: `Requested at ${req.requesTime}`,
//       result: tours.length,
//       data: { tours }
//     });
//   });

//   exports.getTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     //findOne({_id: req.params.id})
//     if (!tour) {
//       return next(new AppError(`Tour ${req.params.id} does not exist`, 404));
//     }
//     res.status(200).json({
//       status: 'success',
//       requestAt: `Requested at ${req.requesTime}`,
//       data: { tour }
//     });

//     // const id = req.params.id * 1;
//     // const tour = tours.find(el => el.id == id);
//     // res.status(200).json({
//     //   status: 'success',
//     //   data: { tour }
//     // });
//   });

//   exports.createTour = catchAsync(async (req, res, next) => {
//     // we are adding next here so that we can call the global error handler
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour
//       }
//     });
//   });

//   exports.updateTour = catchAsync(async (req, res, next) => {
//     const tours = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     });
//     if (!tours) {
//       return next(new AppError(`Tour ${req.params.id} does not exist`, 404));
//     }
//     res.status(200).json({
//       status: 'success',
//       message: `${req.params.id} updated successfully`,
//       data: {
//         tours
//       }
//     });
//   });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError(`Tour ${req.params.id} does not exist`, 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     // message: `${id} deleted successfully`,
//     data: {
//       tour
//     }
//   });
// });
