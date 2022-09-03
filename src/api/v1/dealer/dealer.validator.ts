// /* eslint-disable import/prefer-default-export */
import joi from '@hapi/joi';

export const addDealerSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().required().email(),
  address: joi.string().required(),
  phone: joi.string().required(),
});

export const getDealersShema = joi.object({
  name: joi.string(),
  limit: joi.number().min(0).max(1000).default(10),
  page: joi.number().min(1).default(1),
});
