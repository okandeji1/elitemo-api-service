import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export const DealerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  logo: {
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
DealerSchema.plugin(mongoosePaginate);

const name = 'Dealer';
const schema = DealerSchema;

export { name, schema };
