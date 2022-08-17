import { fileUpload } from '../../../@core/universal';
import { getConnection } from '../../../database/models';
import { AppError, catchAsyncError } from '../../../util/appError';

export const getCars = catchAsyncError(async (req, res) => {
  const obj = req.query;

  const tenantConnection = getConnection(req.query.tenant);
  const { models: tenantModels } = tenantConnection;

  const { limit, page } = req.query;

  let query: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'tenant' || key === 'limit' || key === 'page') {
      continue;
    }
    query = { ...query, [key]: value };
  }

  const options = {
    page,
    limit,
    sort: { createdAt: 'desc' },
    collation: {
      locale: 'en',
    },
    lean: true,
    projection: {
      password: 0,
    },
  };

  const cars: any = await tenantModels.Car.paginate(query, options);

  return res.status(200).json({
    status: true,
    message: 'found car(s)',
    data: cars.docs,
    meta: {
      total: cars.totalDocs,
      skipped: cars.page * cars.limit,
      perPage: cars.limit,
      page: cars.page,
      pageCount: cars.totalPages,
      hasNextPage: cars.hasNextPage,
      hasPrevPage: cars.hasPrevPage,
    },
  });
});

export const addCar = catchAsyncError(async (req, res) => {
  const tenantConnection = getConnection(req.query.tenant);
  const { models: tenantModels } = tenantConnection;
  const obj = req.body;
  // const query = { model: obj.model };

  // const car = await tenantModels.Car.findOne(query);

  // if (car) {
  //   throw new AppError('car already exist', 400);
  // }

  if (Object.keys(req.files).length < 1) {
    return res.status(400).json({
      status: false,
      message: 'you must upload image',
    });
  }
  const upload = await fileUpload({
    files: req.files,
    connection: tenantConnection,
    folder: 'cars',
  });

  if (upload.status) {
    obj.imgUrl = upload.data;
  }

  const newCar: any = await tenantModels.Car.create(obj);

  if (!newCar) {
    throw new AppError('internal server error. if this persist, please contact support', 500);
  }

  return res.status(201).json({
    status: true,
    message: 'new car created successfully',
    data: newCar,
  });
});
