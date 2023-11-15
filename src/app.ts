import express, { Request, Response } from "express";
import logger from "morgan";

import userRoute from "./routes/user";
import { db } from "./config";

const app = express();

//database
db.sync()
  .then(() => console.log("Database is connected..."))
  .catch((err: any) => console.log(err));

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));

//API
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    msg: "You are welcome to user-service of NERDBUG created by KennethJT",
  });
});

app.use("/", userRoute);

export { app };