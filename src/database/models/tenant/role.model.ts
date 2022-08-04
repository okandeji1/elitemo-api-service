import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export const RoleSchema = new Schema({
  role: {
    type: String,
    required: true,
    unique: true,
  },
});
RoleSchema.plugin(mongoosePaginate);

const name = 'Role';
const schema = RoleSchema;

export { name, schema };
