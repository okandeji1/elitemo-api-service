import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export const MerchantSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  logo: {
    type: String,
  },
});
MerchantSchema.plugin(mongoosePaginate);

const name = 'Merchant';
const schema = MerchantSchema;

export { name, schema };
