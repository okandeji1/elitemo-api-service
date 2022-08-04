import joi from '@hapi/joi';

export const setupTenantSchema = joi.object({
  name: joi.string().required(),
  company: joi.string().required(),
  website: joi.string(),
  expiresAt: joi.date(),
  status: joi.any().valid('PENDING', 'ACTIVE', 'INACTIVE'),
});

export const registerTenantSchema = joi.object({
  tenant: joi.string().required(),
});
