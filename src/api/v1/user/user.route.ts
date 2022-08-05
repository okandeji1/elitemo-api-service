import express from 'express';
import * as userController from './user.controller';
import {
  inputValidator,
  resolveConnection,
  isAuthenticated,
  isPermitted,
  // normalize,
} from '../../../util/middleware';
import {
  changePasswordSchema,
  getUserSchema,
  loginUserSchema,
  refreshTokenSchema,
  registerUserSchema,
  setupTenantSchema,
  updateUserSchema,
} from './user.validator';
export const userRouter = express.Router();

userRouter.post(
  '/setup-tenant',
  inputValidator({ body: setupTenantSchema }),
  userController.tenantSetUp,
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
  '/refresh-token',
  inputValidator({ query: refreshTokenSchema }),
  resolveConnection,
  userController.refreshToken,
);

userRouter.put(
  '/update',
  inputValidator({ body: updateUserSchema }),
  resolveConnection,
  isAuthenticated,
  isPermitted(['user:update:own', 'user:update:any']),
  userController.updateUser,
);

userRouter.delete(
  '/delete',
  resolveConnection,
  isAuthenticated,
  isPermitted(['user:delete:any']),
  userController.deleteUser,
);

userRouter.put(
  '/change-password',
  inputValidator({ body: changePasswordSchema }),
  resolveConnection,
  isAuthenticated,
  isPermitted(['user:update:own', 'user:update:any']),
  userController.changePassword,
);

userRouter.get(
  '/',
  inputValidator({ query: getUserSchema }),
  resolveConnection,
  isAuthenticated,
  isPermitted(['user:read:own', 'user:read:any']),
  userController.getUsers,
);

userRouter.get(
  '/me',
  resolveConnection,
  isAuthenticated,
  isPermitted(['user:read:own', 'user:read:any']),
  userController.getUser,
);
