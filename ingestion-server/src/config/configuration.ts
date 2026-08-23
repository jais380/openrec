import { config } from 'dotenv';

config();

export default (): object => {
  const { ENVIRONMENT, NODE_ENV, JWT_SECRET, JWT_EXPIRATION_TIME } =
    process.env;

  return {
    environment: ENVIRONMENT ?? NODE_ENV,
    jwt: {
      JWTSecret: JWT_SECRET,
      JWTExpirationTime: JWT_EXPIRATION_TIME,
    },
  };
};
