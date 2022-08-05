import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export const BlogSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  img: {
    type: String,
  },
});
BlogSchema.plugin(mongoosePaginate);

const name = 'Blog';
const schema = BlogSchema;

export { name, schema };
