import pg from "pg"
import dotenv from "dotenv"
const { Pool } = pg

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})
// console.log(pool.query('SELECT version()'))
// const pool = new Pool({
//   user: process.env.PG_USER,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DATABASE,
//   password: process.env.PG_PASSWORD,
//   port: 5432,
// })

export default pool
