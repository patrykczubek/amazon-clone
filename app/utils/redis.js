import Redis from 'ioredis'

export const getRedisClient = () => Redis.createClient({
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  port: process.env.REDIS_PORT,
  reconnectOnError: (err) => {
    console.log(err)
    const targetError = 'READONLY'
    if (err.message.slice(0, targetError.length) === targetError) {
      return true
    }
  }
})