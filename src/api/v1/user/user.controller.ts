import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
import { generateId } from '../../../@core/universal';
import { getConnectionByName } from '../../../database/models';
import { AppError, catchAsyncError } from '../../../util/appError';

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

  obj.apiKey = {
    live,
    test,
  };

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

export const registerTenant = catchAsyncError(async (req: Request, res: Response) => {
  const tenantConnection = getConnectionByName(req.query.tenant);
  const { models: tenantModels } = tenantConnection;
  const obj = req.body;

  const query = { username: tenantConnection.name };

  const findTenant = await tenantModels.User.findOne(query);

  // Tenant exist
  if (findTenant) {
    throw new AppError('please use existing account or choose another name', 404);
  }

  // Get tenantId
  const tenant = await tenantModels.Tenant.findOne(query).lean();
  obj.username = tenantConnection.name;
  obj.userId = tenant.username;

  const passwordHash = await bcrypt.hash(obj.password, 10);
  obj.password = passwordHash;

  const newUser = await tenantModels.User.create(obj);
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
      id: newUser.id,
      userId: newUser.userId,
      createdAt: newUser.createdAt,
    },
  });
});

export const registerUser = catchAsyncError(async (req: Request, res: Response) => {
  const tenantConnection = getConnectionByName(req.query.tenant);
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
