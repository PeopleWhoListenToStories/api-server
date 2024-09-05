import Redis from 'ioredis';
import * as lodash from 'lodash';
import { RedisDBEnum } from '~/constant';
import { getConfig } from '~/config';

export const buildRedis = (db: RedisDBEnum): Promise<Redis> => {
  const config = getConfig();
  const serverConfig = lodash.get(config, 'server', null);
  const redisConfig = lodash.get(config, 'db.redis', null);

  if (
    !redisConfig.host ||
    !redisConfig.port ||
    !redisConfig.username ||
    !redisConfig.password
  ) {
    console.error(`[${serverConfig.name}] Redis 未配置，无法启动 Redis 服务`);
    return;
  }

  return new Promise((resolve, reject) => {
    const redis = new Redis({
      ...redisConfig,
      showFriendlyErrorStack: true,
      lazyConnect: true,
      db,
    });
    redis.on('ready', () => {
      resolve(redis);
    });
    redis.on('error', (err) => {
      reject(err);
    });
    redis.connect().catch((err) => {
      reject(err);
    });
  });
};
