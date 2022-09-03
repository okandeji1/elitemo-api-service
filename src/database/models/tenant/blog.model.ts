import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export const BlogSchema = new Schema({
  header: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  images: {
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
BlogSchema.plugin(mongoosePaginate);

const name = 'Blog';
const schema = BlogSchema;

export { name, schema };
