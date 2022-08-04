// @ts-nocheck
import { redis } from './redis';

//
export const hooks = (schema) => {
  // prettier-ignore
  schema.post(['save', 'updateOne','updateMany','deleteOne','deleteMany','findOneAndUpdate','findOneAndDelete'], { query: true, document: true }, async function () {
      await redis.del(this.hashKey);
    },
  );

  return schema;
};
