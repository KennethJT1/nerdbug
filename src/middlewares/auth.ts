import { UserInstance as User } from "../models/userModel";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";

export const authMiddleware = async (
  req: JwtPayload,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers?.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.App_secret!);
        req.user = decoded;
        next();
      }
    } catch (e) {
      throw new Error("Not authorized. Please login and try again.");
    }
  } else {
    throw new Error("There is no token attached to header");
  }
};

// export const isAdmin = async (
//   req: JwtPayload,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { id } = req.user;
//   const user = await User.findById(id);
//   if (user!.role !== "admin") {
//     throw new Error("You are not an admin");
//   } else {
//     next();
//   }
// };
