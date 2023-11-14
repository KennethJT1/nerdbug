import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// export const db = new Sequelize('nerdbug', 'root', 'password', {
//   host: 'localhost',
//   dialect: 'mysql',
// });

// export const db = new Sequelize(process.env.CONNECTION_STRING!, {
//   logging: false,
//   dialectOptions: {
//     ssl: {
//       require: false,
//       // rejectUnauthorized: false,
//     },
//   },
// });

export const db = new Sequelize("nerdbug", "root", "password", {
  host: "localhost",
  dialect: "mysql",
  port: 3306,
  logging: false,
});

export const App_secret =
  (process.env.App_secret as string);

export const Expiry =
  (process.env.Expiry as string);
