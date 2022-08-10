import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const SettingSchema = new Schema({
  userCount: Number,
  cloudinaryUrl: Schema.Types.Mixed,
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
