import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const CarSchema = new Schema({
  make: {
    type: String,
  },
  model: {
    type: String,
  },
  brand: {
    type: String,
  },
  reviews: {
    type: Number,
  },
  costPrice: {
    type: Number,
  },
  sellingPrice: {
    type: Number,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
  },
  category: {
    type: String,
  },
  dealer: {
    type: String,
  },
  specifications: {
    type: Schema.Types.Mixed,
  },
  features: {
    type: Schema.Types.Mixed,
  },
  imgUrl: {
    type: Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

CarSchema.plugin(mongoosePaginate);

const name = 'Car';
const schema = CarSchema;

export { name, schema };
