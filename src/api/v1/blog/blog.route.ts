// /* eslint-disable import/prefer-default-export */
import express from 'express';
import { inputValidator, isAuthenticated, resolveConnection } from '../../../util/middleware';
import * as blogController from './blog.controller';
import { addPostSchema, getPostsShema } from './blog.validator';

export const blogRouter = express.Router();

blogRouter.get(
  '/',
  inputValidator({ query: getPostsShema }),
  resolveConnection,
  isAuthenticated,
  blogController.getPosts,
);

blogRouter.post(
  '/add',
  inputValidator({ body: addPostSchema }),
  resolveConnection,
  isAuthenticated,
  blogController.addPost,
);
