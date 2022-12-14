// /* eslint-disable import/prefer-default-export */
import joi from '@hapi/joi';

export const addMerchantSchema = joi.object({
  name: joi.string().required(),
  address: joi.string().required(),
  logo: joi.string().required(),
});

export const getMerchantsShema = joi.object({
  name: joi.string(),
  limit: joi.number().min(0).max(1000).default(10),
  page: joi.number().min(1).default(1),
});
