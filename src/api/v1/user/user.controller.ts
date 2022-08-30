import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
import { generateId } from '../../../@core/universal';
import { getConnection, getConnectionByName } from '../../../database/models';
import { AppError, catchAsyncError } from '../../../util/appError';
import { generateTokens, renewAccessToken } from '../../../util/utility';

const config = process.env;
const { CONNECTION_NAME } = config;

export const tenantSetUp = catchAsyncError(async (req: Request, res: Response) => {
  const tenantConnection = getConnectionByName(CONNECTION_NAME);
  const { models: tenantModels } = tenantConnection;
  const obj = req.body;

  // Check if tenant exists
  const query = { name: tenantConnection.name };

  const tenant = await tenantModels.Tenant.findOne(query);

  if (tenant) {
    throw new AppError('tenant already setup', 203);
  }

  // generate apiKey for B2B tenant
  const test = generateId({ suffix: 'sk-test' });
  const live = generateId({ suffix: 'sk' });

  const whitelist = ['0.0.0.0', '::1'];

  obj.apiKey = {
    live,
    test,
  };
  obj.security = { whitelist };

  const settings = await tenantModels.Setting.findOneAndUpdate(
    {},
    { $inc: { userCount: 1 } },
    { new: true },
  ).lean();

  // TODO: Generate tenantId
  obj.tenantId = settings.userCount;

  const newTenant: any = await new tenantModels.Tenant(obj).save();
  if (!newTenant) {
    throw new AppError('internal server error. if this persist, please contact support', 500);
  }

  return res.status(201).json({
    status: true,
    message: 'new tenant created successfully',
    data: newTenant,
  });
});

export const registerTenant = catchAsyncError(async (req, res) => {
  const tenantConnection = getConnection(req.query.tenant);
  const { models: tenantModels } = tenantConnection;

  const query = { username: tenantConnection.name };

  const findTenant = await tenantModels.User.findOne(query);

  // Tenant exist
  if (findTenant) {
    throw new AppError('please use existing account or choose another name', 404);
  }

  // Get tenantId
  const tenant = await tenantModels.Tenant.findOne(query).lean();
  const passwordHash = await bcrypt.hash('1234567', 10);

  const newUser = await tenantModels.User.create({
    username: tenantConnection.name,
    password: passwordHash,
    role: 'tenant',
    firstName: tenantConnection.name,
    lastName: tenantConnection.name,
    email: `tenant@${tenantConnection.name}.com`,
    userId: tenant.tenantId,
  });
  if (!newUser) {
    throw new AppError('Internal server error', 500);
  }

  return res.status(200).json({
    status: true,
    message: 'new user created successfully',
    data: {
      username: newUser.username,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      id: newUser._id,
      userId: newUser.userId,
      createdAt: newUser.createdAt,
    },
  });
});

export const registerUser = catchAsyncError(async (req, res) => {
  const tenantConnection = getConnection(req.query.tenant);
  const { models: tenantModels } = tenantConnection;
  const obj = req.body;

  const session = await tenantConnection.startSession();
  session.startTransaction();

  const query = { username: obj.username };
  const user = await tenantModels.User.findOne(query);
  if (user) {
    return res.status(404).json({
      status: false,
      message: 'user already exist, please use existing account or choose another name',
    });
  }

  const settings = await tenantModels.Setting.findOneAndUpdate(
    {},
    { $inc: { userCount: 1 } },
    { session, new: true },
  ).lean();

  obj.userId = settings.userCount;

  if (obj.role === 'tenant') {
    return res.status(404).json({
      status: false,
      message: 'no two user can have a role of tenant',
      data: null,
    });
  }

  const passwordHash = await bcrypt.hash(obj.password, 10);
  obj.password = passwordHash;

  const newUser: any = await tenantModels.User.create(obj);

  await session.commitTransaction();
  session.endSession();

  return res.status(200).json({
    status: true,
    message: 'new user created succefully',
    data: {
      username: newUser.username,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      id: newUser.id,
      userId: newUser.userId,
      createdAt: newUser.createdAt,
    },
  });
});

export const loginUser = catchAsyncError(async (req, res) => {
  const tenantConnection = getConnection(req.query.tenant);
  const { models: tenantModels } = tenantConnection;
  const obj = req.body;
  const query = {
    username: obj.username,
  };

  const user = await tenantModels.User.findOne(query).lean();

  if (!user) {
    throw new AppError('user does not exist', 404);
  }

  const isValidPassword = await bcrypt.compare(obj.password, user.password);

  if (!isValidPassword) {
    throw new AppError('your username/password combination is not correct', 401);
  }

  const { accessToken, refreshToken } = generateTokens({
    username: user.username,
    role: user.role,
    userId: user.userId,
  });

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  user.password = undefined;

  return res.status(200).json({
    status: true,
    message: 'user logged in successfully',
    data: user,
  });
});

export const refreshToken = catchAsyncError(async (req, res) => {
  const obj = req.query;

  const { accessToken, refreshToken } = await renewAccessToken(
    req.headers?.authorization.split(' ')[1],
    obj.refreshToken,
  );

  return res.status(200).json({
    status: true,
    message: 'token refreshed successfully',
    data: {
      accessToken,
      refreshToken,
    },
  });
});

export const updateUser = catchAsyncError(async (req, res) => {
  const tenantConnection = getConnection(req.query.tenant);
  const { models: tenantModels } = tenantConnection;

  const session = await tenantConnection.startSession();
  session.startTransaction();

  const obj = req.body;
  const opts = { session, new: true };

  if (obj.password) {
    const hash = await bcrypt.hash(obj.password, 10);
    obj.password = hash;
  }

  const updatedUser: any = await tenantModels.User.findOneAndUpdate(
    { username: obj.username },
    obj,
    opts,
  );
  if (!updatedUser) {
    throw new AppError('User does not exist', 404);
  }

  await session.commitTransaction();
  session.endSession();
  return res.status(200).json({
    status: true,
    message: 'user updated successfully',
    data: updatedUser,
  });
});

export const getUsers = catchAsyncError(async (req, res) => {
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

  const users: any = await tenantModels.User.paginate(query, options);

  return res.status(200).json({
    status: true,
    message: 'found user(s)',
    data: users.docs,
    meta: {
      total: users.totalDocs,
      skipped: users.page * users.limit,
      perPage: users.limit,
      page: users.page,
      pageCount: users.totalPages,
      hasNextPage: users.hasNextPage,
      hasPrevPage: users.hasPrevPage,
    },
  });
});

export const getUser = catchAsyncError(async (req, res): Promise<any> => {
  const tenantConnection = getConnection(req.query.tenant);
  const { models: tenantModels } = tenantConnection;

  const query = { username: req.user.username };
  const user = await tenantModels.User.findOne(query).lean();

  return res.status(200).json({
    status: true,
    message: 'found user(s)',
    data: user,
  });
});

export const changePassword = catchAsyncError(async (req, res) => {
  const obj = req.body;
  const tenantConnection = getConnection(req.query.tenant);
  const { models: tenantModels } = tenantConnection;

  const user = await tenantModels.User.findOne({ username: req?.user.username });

  if (!user) {
    throw new AppError('user not found', 404);
  }

  const isValidPassword = await bcrypt.compare(obj.password, user.password);
  if (!isValidPassword) {
    throw new AppError('your password is not correct', 401);
  }

  const passwordHash = await bcrypt.hash(obj.newPassword, 10);

  const updatedUser: any = await tenantModels.User.findOneAndUpdate(
    { username: req?.user.username },
    { password: passwordHash },
    { new: true },
  );

  return res.status(200).json({
    status: true,
    message: 'password changed successfully',
    data: {
      user: updatedUser.username,
      role: updatedUser.role,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
    },
  });
});

export const deleteUser = catchAsyncError(async (req, res) => {
  const obj = req.query;
  const tenantConnection = getConnection(req.query.tenant);
  const { models: tenantModels } = tenantConnection;

  const query = { username: obj.username };

  const user: any = await tenantModels.User.findOneAndDelete(query);

  if (!user) {
    throw new AppError('user not exist', 404);
  }

  return res.status(200).json({
    status: true,
    message: 'user deleted successfully',
    data: 'user has been deleted',
  });
});
