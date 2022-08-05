// /* eslint-disable import/prefer-default-export */
import express from 'express';
import { inputValidator, isAuthenticated, resolveConnection } from '../../../util/middleware';
import * as merchantController from './merchant.controller';
import { addMerchantSchema, getMerchantsShema } from './merchant.validator';

export const merchantRouter = express.Router();

merchantRouter.get(
  '/',
  inputValidator({ query: getMerchantsShema }),
  resolveConnection,
  isAuthenticated,
  merchantController.getMerchants,
);

merchantRouter.post(
  '/add',
  inputValidator({ body: addMerchantSchema }),
  resolveConnection,
  isAuthenticated,
  merchantController.addMerchant,
);
