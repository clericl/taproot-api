const { createClient } = require('redis');

type RedisClient = ReturnType<typeof createClient>;

class Redis {
  client: RedisClient;

  static initClient() {
    return createClient({
      password: process.env.REDIS_KEY,
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '13486'),
      },
    });
  }

  constructor(client: RedisClient) {
    this.client = client || Redis.initClient();
  }
}

export default Redis;
