// /* eslint-disable import/prefer-default-export */
import express from 'express';
import { inputValidator, isAuthenticated, resolveConnection } from '../../../util/middleware';
import * as dealerController from './dealer.controller';
import { addDealerSchema, getDealersShema } from './dealer.validator';

export const dealerRouter = express.Router();

dealerRouter.get(
  '/',
  inputValidator({ query: getDealersShema }),
  resolveConnection,
  isAuthenticated,
  dealerController.getDealers,
);

dealerRouter.post(
  '/add',
  inputValidator({ body: addDealerSchema }),
  resolveConnection,
  isAuthenticated,
  dealerController.addDealer,
);
