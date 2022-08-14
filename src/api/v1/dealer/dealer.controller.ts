import { getConnection } from '../../../database/models';
import { catchAsyncError, AppError } from '../../../util/appError';

export const getDealers = catchAsyncError(async (req, res) => {
  const tenantConnection = getConnection(req.query.tenant);
  const { models: tenantModels } = tenantConnection;
  const obj = req.query;

  const { limit, page } = req.query;

  let query = {};
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
    projection: {},
  };

  const dealers: any = await tenantModels.Merchant.paginate(query, options);

  return res.status(200).json({
    status: true,
    message: 'found dealer(s)',
    data: dealers.docs,
    meta: {
      total: dealers.totalDocs,
      skipped: dealers.page * dealers.limit,
      perPage: dealers.limit,
      page: dealers.page,
      pageCount: dealers.totalPages,
      hasNextPage: dealers.hasNextPage,
      hasPrevPage: dealers.hasPrevPage,
    },
  });
});

export const addDealer = catchAsyncError(async (req, res) => {
  const tenantConnection = getConnection(req.query.tenant);
  const { models: tenantModels } = tenantConnection;
  const obj = req.body;

  if (req?.user?.role !== 'tenant' && req?.user?.role !== 'super-admin') {
    throw new AppError('You do not have sufficient permission to perform this operation', 403);
  }

  // Check if the user exist
  const dealer = await tenantModels.Dealer.findOne({ name: obj.name });
  if (dealer) {
    throw new AppError('Dealer already exist', 203);
  }

  const addDealer = await tenantModels.Dealer.create(obj);

  if (!addDealer) {
    throw new AppError('Internal server error', 500);
  }

  return res.status(200).json({
    status: true,
    data: addDealer,
    message: 'Dealer added successfuly',
  });
});
