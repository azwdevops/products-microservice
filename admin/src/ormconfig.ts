import dotenv from "dotenv";
import { DataSourceOptions } from "typeorm";

dotenv.config();

const config: DataSourceOptions = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ["src/entity/*.js"],
  logging: false,
  synchronize: true,
};

export default config;
