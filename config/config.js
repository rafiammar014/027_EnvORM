const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const database = process.env.DB_NAME || process.env.DB_DATABASE;
const username = process.env.DB_USER;
const password = process.env.DB_PASS || process.env.DB_PASSWORD || '';
const host = process.env.DB_HOST || '127.0.0.1';
const port = Number(process.env.DB_PORT || 5432);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('DB_PORT must be an integer between 1 and 65535');
}

const development = {
  username,
  password,
  database,
  host,
  port,
  dialect: 'postgres'
};

const test = { ...development };
const production = {
  use_env_variable: "POSTGRES_URL",
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false
    }
  }
};

module.exports = { development, test, production };