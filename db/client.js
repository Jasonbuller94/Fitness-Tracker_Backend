const { Pool } = require("pg");
const connectionString =
  process.env.DATABASE_URL ||
  "https://postgres:postgres@localhost:5432/fitnessdev";
const client = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

module.exports = client;
