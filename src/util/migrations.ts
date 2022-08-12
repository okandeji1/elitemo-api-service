import { Request, Response, Router } from 'express';

// import { resolveConnection } from './middleware';
import { AppError, catchAsyncError } from './appError';
import { getConnection } from '../database/models';

const config = process.env;
const { CLOUDINARY_URL, CONNECTION_NAME } = config;
export const migrationRouter = Router();

export const migrate = catchAsyncError(async (req: Request, res: Response) => {
  const connectionName: any = CONNECTION_NAME;

  const tenantConnection = getConnection(connectionName);
  const { models: tenantModels } = tenantConnection;

  const obj: any = {};

  obj.userCount = 1000;
  obj.cloudinaryUrl = CLOUDINARY_URL;

  const setting = await tenantModels.Setting.create(obj);

  if (!setting) {
    throw new AppError('internal server error. if this persist, please contact support', 500);
  }

  return res.status(200).json({
    status: true,
    message: 'migration completed successfully',
    data: setting,
  });
});

migrationRouter.get('/migrate', migrate);
