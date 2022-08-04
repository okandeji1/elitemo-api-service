import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const SettingSchema = new Schema({
  userCount: Number,
  cloudinaryUrl: Schema.Types.Mixed,
});

SettingSchema.plugin(mongoosePaginate);

const name = 'Setting';
const schema = SettingSchema;

export { name, schema };
