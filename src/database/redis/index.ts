/* eslint-disable prefer-rest-params */
// @ts-nocheck

import Redis from 'ioredis';
import mongoose from 'mongoose';
import logger from '../../util/logger/logger';

export const redis = new Redis(process.env.REDIS_URL);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options: any = { expire: 60 * 60 * 1 }) {
  this.useCache = true;
  this.expire = options.expire;
  this.hashKey = JSON.stringify(options.key || this.mongooseCollection.name);

  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return await exec.apply(this, arguments);
  }

  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name,
  });

  const cacheValue = await redis.hget(this.hashKey, key);

  if (!cacheValue) {
    const result = await exec.apply(this, arguments);
    redis.hset(this.hashKey, key, JSON.stringify(result));
    redis.expire(this.hashKey, this.expire);
    return result;
  }

  const doc = JSON.parse(cacheValue);
  return Array.isArray(doc) ? doc.map((d) => new this.model(d)) : new this.model(doc);
};

logger.log('info', 'Redis Cache connected successfully');
