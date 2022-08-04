// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
import { generateId } from '../../../@core/universal';
import { getConnectionByName } from '../../../database/models';
import { AppError, catchAsyncError } from '../../../util/appError';

const config = process.env;
const { CONNECTION_NAME } = config;

export const tenantSetUp = catchAsyncError(async (req, res) => {
  const obj = req.body;
  const tennantConnection = getConnectionByName(CONNECTION_NAME);
  const { models: tenantModels } = tennantConnection;

  // Check if user exists
  const query = { name: tennantConnection.name };

  const user = await tenantModels.Tenant.findOne(query);

  if (user) {
    throw new AppError('please use existing account or choose another name', 404);
  }

  // generate apiKey for B2B User
  const test = generateId({ suffix: 'sk-test' });
  const live = generateId({ suffix: 'sk' });

  obj.apiKey = {
    live,
    test,
  };

  // TODO: Generate tenantId

  const newUser: any = await new tenantModels.Tenant(obj).save();

  return res.status(200).json({
    status: true,
    message: 'new user created succefully',
    data: {
      username: newUser.username,
      role: newUser.role,
      parent: newUser.parent,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      id: newUser.id,
      createdAt: newUser.createdAt,
      wallet: newUser.wallet,
    },
  });
});
