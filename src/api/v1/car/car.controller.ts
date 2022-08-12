import { getConnection } from '../../../database/models';
import { catchAsyncError } from '../../../util/appError';

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
