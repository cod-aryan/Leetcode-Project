import { createClient } from 'redis';

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    }
});

redisClient.on('error', (err) => {
    console.error('⚠️ Redis Client Runtime Error:', err.message);
});

async function initializeDatabases() {
  try {
    await redisClient.connect();
    console.log('🚀 Successfully connected to the Cloud Redis cluster!');
  } catch (error) {
    console.error('❌ Failed to connect to Redis during startup:', error);
  }
}

export { initializeDatabases };

export default redisClient;