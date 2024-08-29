import { createClient } from "redis";

const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: Number(process.env.REDIS_PORT)
    }
  });
  
  redisClient.on("error", err => console.log(err))
  
  if(!redisClient.isOpen) redisClient.connect()

export default redisClient