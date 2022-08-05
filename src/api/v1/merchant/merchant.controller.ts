import { getConnection } from '../../../database/models';
import { catchAsyncError, AppError } from '../../../util/appError';

export const getMerchants = catchAsyncError(async (req, res) => {
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

  const merchants: any = await tenantModels.Merchant.paginate(query, options);

  return res.status(200).json({
    status: true,
    message: 'found merchant(s)',
    data: merchants.docs,
    meta: {
      total: merchants.totalDocs,
      skipped: merchants.page * merchants.limit,
      perPage: merchants.limit,
      page: merchants.page,
      pageCount: merchants.totalPages,
      hasNextPage: merchants.hasNextPage,
      hasPrevPage: merchants.hasPrevPage,
    },
  });
});

export const addMerchant = catchAsyncError(async (req, res) => {
  const tenantConnection = getConnection(req.query.tenant);
  const { models: tenantModels } = tenantConnection;
  const obj = req.body;

  if (req?.user?.role !== 'tenant' && req?.user?.role !== 'super-admin') {
    throw new AppError('You do not have sufficient permission to perform this operation', 403);
  }

  // Check if the user exist
  const merchant = await tenantModels.Merchant.findOne({ name: obj.name });
  if (merchant) {
    throw new AppError('Merchant already exist', 203);
  }

  const addMerchant = await tenantModels.Merchant.create(obj);

  if (!addMerchant) {
    throw new AppError('Internal server error', 500);
  }

  return res.status(200).json({
    status: true,
    data: addMerchant,
    message: 'Merchant added successfuly',
  });
});
