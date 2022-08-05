import { getConnection } from '../../../database/models';
import { catchAsyncError, AppError } from '../../../util/appError';

export const getPosts = catchAsyncError(async (req, res) => {
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

  const posts: any = await tenantModels.Blog.paginate(query, options);

  return res.status(200).json({
    status: true,
    message: 'found post(s)',
    data: posts.docs,
    meta: {
      total: posts.totalDocs,
      skipped: posts.page * posts.limit,
      perPage: posts.limit,
      page: posts.page,
      pageCount: posts.totalPages,
      hasNextPage: posts.hasNextPage,
      hasPrevPage: posts.hasPrevPage,
    },
  });
});

export const addPost = catchAsyncError(async (req, res) => {
  const tenantConnection = getConnection(req.query.tenant);
  const { models: tenantModels } = tenantConnection;
  const obj = req.body;

  if (req?.user?.role !== 'tenant' && req?.user?.role !== 'super-admin') {
    throw new AppError('You do not have sufficient permission to perform this operation', 403);
  }

  // Check if the user exist
  const post = await tenantModels.Blog.findOne({ name: obj.name });
  if (post) {
    throw new AppError('post already exist', 203);
  }

  const addpost = await tenantModels.Blog.create(obj);

  if (!addpost) {
    throw new AppError('Internal server error', 500);
  }

  return res.status(200).json({
    status: true,
    data: addpost,
    message: 'post added successfuly',
  });
});
