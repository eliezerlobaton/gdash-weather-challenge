import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  mongodb: {
    uri:
      process.env.MONGODB_URI ||
      `mongodb://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=admin`,
  },
}));
