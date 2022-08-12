import express from 'express';
import * as carController from './car.controller';
import { resolveConnection, isAuthenticated } from '../../../util/middleware';

export const carRouter = express.Router();

carRouter.get(
  '/',
  // inputValidator({ query: getUserSchema }),
  resolveConnection,
  isAuthenticated,
  carController.getCars,
);
