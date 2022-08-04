import jwt from 'jsonwebtoken';
import joi from '@hapi/joi';
import xml from 'xml2js';
import { redis } from '../database/redis';
import { AppError } from './appError';
import { getConnection } from '../database/models';

const JWT_SECRET: any = process.env.CONFIG;

export const makeToken = (user, lifespan = '1d') =>
  jwt.sign({ user }, JWT_SECRET, {
    expiresIn: lifespan,
  });

export const generateTokens = (user, saveKey?) => {
  const accessToken = makeToken(user);
  const refreshToken = makeToken(user, '30d');
  const key = saveKey ? saveKey : refreshToken;
  redis.hset('tokens', key, accessToken);
  return { accessToken, refreshToken };
};

export const verifyToken = (accessToken, checkExpiry = true) => {
  // @ts-ignore
  const { exp, user } = jwt.verify(accessToken, JWT_SECRET);

  if (checkExpiry) {
    // convert exp to milliseconds by multiplying by 1000
    if (+new Date() > exp * 1000) {
      throw new AppError('token expired! Please re-login', 401);
    }
  }
  return user;
};

export const renewAccessToken = async (oldAccessToken, refreshToken) => {
  const savedAccessToken = await redis.hget('tokens', refreshToken);

  if (!savedAccessToken || savedAccessToken !== oldAccessToken) {
    throw new AppError('invalid accessToken/refreshToken combination', 400);
  }

  const savedUser = verifyToken(refreshToken);
  if (savedUser && savedUser.usename) {
    removeFromTokenList(refreshToken);
    const tenantConnection = getConnection();
    const { models: tenantModels } = tenantConnection;
    const user = await tenantModels.User.findOne({ username: savedUser.username });

    if (!user) {
      throw new AppError('user not found', 404);
    }

    const { accessToken } = generateTokens({
      username: user.username,
      role: user.role,
      roles: user.roles,
      userId: user.userId,
      parent: user.parent,
      genealogy: user.genealogy,
    });
    return { accessToken, refreshToken };
  }
  throw new AppError('Invalid refresh token: supplied token is invalid', 400);
};

export const removeFromTokenList = (token) => {
  redis.hdel('tokens', token);
};

const builder = new xml.Builder({
  renderOpts: { pretty: false },
});

export const buildResponse = (response, statusCode, data, preTag = 'Response') => {
  return response.format({
    'application/json': () => {
      response.status(statusCode).json(data);
    },
    'application/xml': () => {
      response.status(statusCode).send(builder.buildObject({ [preTag]: data }));
    },
    default: () => {
      // log the request and respond with 406
      response.status(406).send('Not Acceptable');
    },
  });
};

export const includesSome = (arr, values) => values.some((v) => arr.includes(v));

export const paginationSchema = () => ({
  query: {
    limit: joi.number().min(0).max(1000).default(10),
    page: joi.number().min(1).default(1),
  },
});
