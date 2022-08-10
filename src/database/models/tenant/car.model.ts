import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const SettingSchema = new Schema({
  make: {
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
  merchant: {
    type: String,
  },
  specifications: {
    type: Schema.Types.Mixed,
  },
  features: {
    type: Schema.Types.Mixed,
  },
  imgUrl: {
    type: String,
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

SettingSchema.plugin(mongoosePaginate);

const name = 'Setting';
const schema = SettingSchema;

export { name, schema };
