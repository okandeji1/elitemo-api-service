// /* eslint-disable import/prefer-default-export */
import express from 'express';
import multer from 'multer';

const upload = multer({ dest: `${process.env.APP_ROOT}./uploads` });
import {
  inputValidator,
  isAuthenticated,
  normalize,
  resolveConnection,
} from '../../../util/middleware';
import * as blogController from './blog.controller';
import { addPostSchema, getPostsShema } from './blog.validator';

export const blogRouter = express.Router();

blogRouter.get(
  '/',
  inputValidator({ query: getPostsShema }),
  resolveConnection,
  blogController.getPosts,
);

blogRouter.post(
  '/add/post',
  upload.fields([{ name: 'image', maxCount: 4 }]),
  normalize,
  inputValidator({ body: addPostSchema }),
  resolveConnection,
  isAuthenticated,
  blogController.addPost,
);
