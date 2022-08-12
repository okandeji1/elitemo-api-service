/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable no-return-assign */
/* eslint-disable no-restricted-syntax */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { getNamespace } from 'cls-hooked';
import logger from '../../util/logger/logger';
import { hooks } from '../hooks';
import { AppError } from '../../util/appError';

const basename = path.basename(__filename);

const db: any = {};
const MONGO_URL: any = process.env.MONGO_URL;
const connectionName: any = process.env.CONNECTION_NAME;
const tenantFiles = fs.readdirSync(path.join(__dirname, './tenant'));

const files = tenantFiles.filter((file) => {
  return (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.includes('model') &&
    file.includes('map') === false
  );
});

db[connectionName] = mongoose.createConnection(MONGO_URL);

for (const file of files) {
  // eslint-disable-next-line prefer-const
  let { name, schema } = require(path.join(__dirname, './tenant', file));

  schema = hooks(schema);
  db[connectionName].model(name, schema);
}
/**
 * get the connection information (sequelize instance) by tenant name
 */
export const getConnectionByName = (name) => {
  if (db) {
    return db[name];
  }
  return null;
};

/**
 * Get the connection information (sequelize instance) for current context. Here we have used a
 * getNamespace from 'continuation-local-storage'. This will let us get / set any
 * information and binds the information to current request context.
 */
export const getConnection = (connection: string | undefined = undefined) => {
  let conn;
  if (connection) {
    conn = getConnectionByName(connection);
  } else {
    const nameSpace = getNamespace('unique context');
    conn = nameSpace.get('connection');
  }

  if (!conn) {
    logger.log('error', 'Connection is not set for the tenant database.');
    throw new AppError('Connection is not set for the tenant database.', 412);
  }
  return conn;
};

export default db;
