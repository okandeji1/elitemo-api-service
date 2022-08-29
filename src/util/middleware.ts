/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable consistent-return */
import { createNamespace } from 'cls-hooked';
import { getConnectionByName, getConnection } from '../database/models';
import { AppError } from './appError';
import { includesSome, paginationSchema, buildResponse, verifyToken } from './utility';

const config = process.env;
const { CONNECTION_NAME } = config;

export const inputValidator = (schema: any) => {
  return (req, res, next) => {
    if (schema.paginationQuery) {
      schema.query = schema.query.keys(paginationSchema().query);
      delete schema.paginationQuery;
    }

    for (const [key, item] of Object.entries(schema)) {
      // @ts-ignore
      const { error, value } = item.validate(req[key], { abortEarly: false });

      if (error) {
        return res.status(400).json({
          status: false,
          message: error.message,
          data: 'invalid payload',
        });
      }
      req[key] = value;
    }

    next();
  };
};

export const isAuthenticated = (req, res, next) => {
  let accessToken = req.headers?.authorization || req.query.accessToken;
  if (!accessToken) {
    throw new AppError('access token not found', 401);
  }
  try {
    // stripe auth kind (e.g bearer) from the accesstoken
    const auth = accessToken.split(' ');
    // eslint-disable-next-line prefer-destructuring
    accessToken = auth[1];

    req.user = verifyToken(accessToken);

    next();
  } catch (error: any) {
    if (error.name?.includes('JsonWebTokenError') || error.name?.includes('TokenExpiredError')) {
      throw new AppError(error.message, 401);
    }
    throw new AppError('invalid access token', 401);
  }
};

// Create a namespace for the application.
const nameSpace = createNamespace('unique context');

/**
 * Get the connection instance for the given tenant's slug and set it to the current context.
 * */
export const resolveConnection = async (req, res, next) => {
  const apiKey = req.query['x-api-key'] ? req.query['x-api-key'] : req.headers?.['x-api-key'];

  if (!apiKey) {
    return buildResponse(res, 401, { status: false, message: 'please provide api key' });
  }

  let query = {};

  if (apiKey.includes('test')) {
    query = { 'apiKey.test': apiKey };
  } else {
    query = { 'apiKey.live': apiKey };
  }

  const tenantConnection = getConnectionByName(CONNECTION_NAME);
  const { models: tenantModels } = tenantConnection;
  const tenant = await tenantModels.Tenant.findOne(query).lean();
  if (!tenant) {
    return buildResponse(res, 401, {
      status: false,
      message: 'unauthorized API key, your API key is not recognized',
    });
  }

  if (
    !apiKey.includes('test') &&
    (includesSome(tenant.security.blacklist, [req.ip]) ||
      (!includesSome(tenant.security.whitelist, ['0.0.0.0']) &&
        !includesSome(tenant.security.whitelist, [req.ip])))
  ) {
    return buildResponse(res, 401, {
      status: false,
      message: 'unauthorized host, your host ip is not permitted',
    });
  }

  // Run the application in the defined namespace. It will contextualize every underlying function calls.
  nameSpace.run(() => {
    nameSpace.set('connection', getConnectionByName(tenant.name)); // This will set the knex instance to the 'connection'
    next();
  });
};

export const isPermitted = (permissions: Array<string>) => {
  // eslint-disable-next-line no-unused-vars

  return async (req, res, next) => {
    const tenantConnection = getConnection();
    const { models: tenantModels } = tenantConnection;

    if (tenantConnection.name === 'provider') {
      // NOTE: provider has all permission
      next();
    } else {
      const $or: any = [];
      for (const role of req?.user?.roles) {
        $or.push({ role });
      }
      const roles = await tenantModels.Role.find({ $or }).lean();

      let userPermissions: any = [];
      for (const role of roles) {
        userPermissions = [...new Set([...role.permissions, ...userPermissions])];
      }

      if (!includesSome(userPermissions, permissions)) {
        return res.status(401).json({
          status: false,
          message: `you do not have sufficient permission, ${permissions} required`,
          data: 'unauthorized',
        });
      }

      next();
    }
  };
};

export const logActivity = async (options: any) => {
  await options.tenantModels.Activity.create(options);
};

export const normalize = async (req, res, next) => {
  req.body = {
    ...req.body,
    specifications: JSON.parse(req.body.specifications),
    features: JSON.parse(req.body.features),
  };
  delete req.body.image;

  next();
};
