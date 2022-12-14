// /* eslint-disable import/prefer-default-export */
import joi from '@hapi/joi';

export const addPostSchema = joi.object({
  name: joi.string().required(),
  address: joi.string().required(),
  logo: joi.string().required(),
});

export const getPostsShema = joi.object({
  name: joi.string(),
  limit: joi.number().min(0).max(1000).default(10),
  page: joi.number().min(1).default(1),
});
