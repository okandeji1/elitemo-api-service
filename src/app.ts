import express, { Application } from 'express';
import compression from 'compression'; // compresses requests
// import mongoose from 'mongoose'
import path from 'path';
import cors from 'cors';
import './database/redis';
import db from './database/models';

import { AppError, globalErrorHandler } from './util/appError';

import logger from './util/logger/logger';
// HACK: to get app root
process.env.APP_ROOT = path.join(__dirname, '../');

// import routes
import { userRouter } from './api/v1/user/user.route';
import { dealerRouter } from './api/v1/dealer/dealer.route';
import { carRouter } from './api/v1/car/car.route';
import { blogRouter } from './api/v1/blog/blog.route';

// @ts-ignore
import { migrationRouter } from './util/migrations';

// set up error handler
process.on('uncaughtException', (e: any) => {
  logger.log('error', e.stack);
  process.exit(1);
});

process.on('unhandledRejection', (e: any) => {
  logger.log('error', e.stack);
  process.exit(1);
});

// HACK: to get app root
process.env.APP_ROOT = path.join(__dirname, '../');

// Create Express server
const app: Application = express();

Object.keys(db).forEach((connection) => {
  db[connection].on('error', (error: any) => {
    logger.log('error', `MongoDB database connection error: ${error}`);
    throw error;
  });

  db[connection].once('open', () => {
    logger.log('info', 'MongoDB database connection opened successfully.');
  });
});

// Express configuration
app.set('port', Number(process.env.PORT) || 9090);
app.use(express.static(path.join('public'), { maxAge: 31557600000 }));

app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(compression());
app.use(cors());
app.use(express.json());

// routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/dealers', dealerRouter);
app.use('/api/v1/cars', carRouter);
app.use('/api/v1/blogs', blogRouter);
// migration
app.use('/api/v1/migrations', migrationRouter);

app.all('*', (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
