import express from 'express';
import multer from 'multer';
import {
  inputValidator,
  isAuthenticated,
  normalize,
  resolveConnection,
} from '../../../util/middleware';
import * as dealerController from './dealer.controller';
import { addDealerSchema, getDealersShema } from './dealer.validator';
const upload = multer({ dest: `${process.env.APP_ROOT}./uploads` });

export const dealerRouter = express.Router();

dealerRouter.get(
  '/',
  inputValidator({ query: getDealersShema }),
  resolveConnection,
  dealerController.getDealers,
);

dealerRouter.post(
  '/add',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  normalize,
  inputValidator({ body: addDealerSchema }),
  resolveConnection,
  isAuthenticated,
  dealerController.addDealer,
);
