import dotenv from "dotenv";
import { DataSourceOptions } from "typeorm";

dotenv.config();

const config: DataSourceOptions = {
  type: "mongodb",
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: ["src/entity/*.js"],
  cli: { entitiesDir: "src/entity" },
};

export default config;
