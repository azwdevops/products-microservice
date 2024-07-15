"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var config = {
    type: "mongodb",
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: ["src/entity/*.js"],
    cli: { entitiesDir: "src/entity" },
};
exports.default = config;
