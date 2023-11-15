import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const db = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
  host: "localhost",
  dialect: "mysql",
  port: 3306,
  logging: false,
});

export const db1 = new Sequelize(process.env.DB_NAME1!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
  host: "localhost",
  dialect: "mysql",
  port: 3306,
  logging: false,
});

export const App_secret =
  (process.env.App_secret as string);

export const Expiry =
  (process.env.Expiry as string);
