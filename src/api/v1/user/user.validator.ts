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

export const registerUserSchema = joi.object({
  username: joi.string(),
  password: joi.string().required(),
  role: joi.string().valid('tenant', 'super-admin', 'admin', 'staff').required(),
  firstName: joi.string(),
  lastName: joi.string(),
  state: joi.string(),
  country: joi.string(),
  dob: joi.date(),
  email: joi.string().email().required(),
  phone: joi.string(),
  address: joi.string(),
  gender: joi.string(),
});

export const updateUserSchema = joi.object({
  username: joi.string().required(),
  password: joi.string().min(4),
  role: joi.string(),
  roles: joi.array().items(joi.string()),
  parent: joi.string(),
  designation: joi.string(),
  userId: joi.string(),
  firstName: joi.string(),
  lastName: joi.string(),
  settings: joi.any(),
  gender: joi.string(),
  extras: joi.any(),
  phone: joi.object({
    code: joi.string(),
    number: joi.string(),
  }),
  bankDetails: joi.object({
    personal: joi.array().items(),
  }),

  email: joi.string().email(),
  state: joi.string(),
  commission: joi.object({
    plan: joi.string(),
    percentage: joi.string(),
  }),
  lga: joi.string(),
  country: joi.string(),
  dob: joi.date(),
  address: joi.string(),
});

export const loginUserSchema = joi.object({
  username: joi.string().required(),
  password: joi.string().min(6).required(),
});

export const refreshTokenSchema = joi.object({
  refreshToken: joi.string().required(),
});

export const deleteUserSchema = joi.object({
  username: joi.string().required(),
});

export const getUserSchema = joi.object({
  username: joi.string(),
  status: joi.string(),
  role: joi.string(),
  limit: joi.number().min(0).max(1000).default(50),
  page: joi.number().min(1).default(1),
});

export const changePasswordSchema = joi.object({
  password: joi.string().min(6).required(),
  newPassword: joi.string().min(6).required(),
});
