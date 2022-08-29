import joi from '@hapi/joi';

export const getCarSchema = joi.object({
  model: joi.string(),
  brand: joi.string(),
  make: joi.string(),
  dealer: joi.string(),
  category: joi.string(),
  type: joi.string(),
  specifications: joi.string(),
  features: joi.string(),
  limit: joi.number().min(0).max(1000).default(50),
  page: joi.number().min(1).default(1),
});

export const addCarSchema = joi.object({
  model: joi.string().required(),
  brand: joi.string().required(),
  make: joi.string().required(),
  dealer: joi.string().required(),
  category: joi.string(),
  type: joi.string().required(),
  description: joi.string(),
  costPrice: joi.number().integer().positive().invalid(0).required(),
  sellingPrice: joi.number().integer().positive().invalid(0),
  features: joi.array().items().required(),
  specifications: joi.object({
    fuelType: joi.string(),
    speed: joi.string(),
    transmission: joi.string(),
    gears: joi.string(),
    year: joi.string(),
    horsePower: joi.string(),
    topSpeed: joi.string(),
    driveTrain: joi.string(),
    doors: joi.string(),
    location: joi.string(),
    mileage: joi.string(),
    bodyStyle: joi.string(),
    condition: joi.string(),
    engine: joi.string(),
  }),
});
