import express from 'express';
import * as userController from './user.controller';
import {
  inputValidator,
  // resolveConnection,
  // isAuthenticated,
  // isPermitted,
  // normalize,
} from '../../../util/middleware';
import { setupTenantSchema } from './user.validator';
export const userRouter = express.Router();

userRouter.post(
  '/setup-tenant',
  inputValidator({ body: setupTenantSchema }),
  userController.tenantSetUp,
);
