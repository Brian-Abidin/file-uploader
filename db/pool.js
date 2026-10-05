require("dotenv").config();
const { Pool } = require("pg");

module.exports = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USERNAME,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
});
