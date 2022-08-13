import express from 'express';
import multer from 'multer';
import * as carController from './car.controller';
import {
  resolveConnection,
  isAuthenticated,
  normalize,
  inputValidator,
} from '../../../util/middleware';
import { addCarSchema, getCarSchema } from './car.validator';
const upload = multer({ dest: `${process.env.APP_ROOT}./uploads` });

export const carRouter = express.Router();

carRouter.get(
  '/',
  inputValidator({ query: getCarSchema }),
  resolveConnection,
  isAuthenticated,
  carController.getCars,
);

carRouter.post(
  '/add',
  upload.fields([{ name: 'image', maxCount: 4 }]),
  normalize,
  inputValidator({ body: addCarSchema }),
  resolveConnection,
  isAuthenticated,
  carController.addCar,
);
