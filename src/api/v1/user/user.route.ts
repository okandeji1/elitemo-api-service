import express from 'express';
import * as userController from './user.controller';
import { inputValidator, resolveConnection, isAuthenticated } from '../../../util/middleware';
import {
  changePasswordSchema,
  getUserSchema,
  loginUserSchema,
  refreshTokenSchema,
  registerTenantSchema,
  registerUserSchema,
  setupTenantSchema,
  updateUserSchema,
} from './user.validator';
export const userRouter = express.Router();

userRouter.post(
  '/tenant/setup',
  inputValidator({ body: setupTenantSchema }),
  userController.tenantSetUp,
);

userRouter.post(
  '/tenant/register',
  inputValidator({ body: registerTenantSchema }),
  resolveConnection,
  userController.registerTenant,
);

userRouter.post(
  '/register',
  inputValidator({ body: registerUserSchema }),
  resolveConnection,
  isAuthenticated,
  userController.registerUser,
);

userRouter.post(
  '/login',
  inputValidator({ body: loginUserSchema }),
  resolveConnection,
  userController.loginUser,
);

userRouter.get(
  '/refresh/token',
  inputValidator({ query: refreshTokenSchema }),
  resolveConnection,
  userController.refreshToken,
);

userRouter.put(
  '/update',
  inputValidator({ body: updateUserSchema }),
  resolveConnection,
  isAuthenticated,
  userController.updateUser,
);

userRouter.delete('/delete', resolveConnection, isAuthenticated, userController.deleteUser);

userRouter.put(
  '/change/password',
  inputValidator({ body: changePasswordSchema }),
  resolveConnection,
  isAuthenticated,
  userController.changePassword,
);

userRouter.get(
  '/',
  inputValidator({ query: getUserSchema }),
  resolveConnection,
  isAuthenticated,
  userController.getUsers,
);

userRouter.get('/me', resolveConnection, isAuthenticated, userController.getUser);
