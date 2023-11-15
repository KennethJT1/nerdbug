import { UserInstance as User, UserAttributes } from "../models/userModel";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";

// export const authMiddleware = async (
//   req: JwtPayload,
//   res: Response,
//   next: NextFunction
// ) => {
//   let token;

//   if (req?.headers?.authorization?.startsWith("Bearer")) {
//     token = req.headers?.authorization.split(" ")[1];
//     try {
//       if (token) {
//         const decoded = jwt.verify(token, process.env.App_secret!);
//         req.user = decoded;
//         next();
//       }
//     } catch (e) {
//       throw new Error("Not authorized. Please login and try again.");
//     }
//   } else {
//     throw new Error("There is no token attached to header");
//   }
// };


export const authMiddleware = async (
  req: JwtPayload,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).json({
        Error: "Kindly login",
      });
    }
    //Bearer token
    const token = authorization.slice(7, authorization.length);
    let verified = jwt.verify(token, process.env.App_secret!);
    if (!verified) {
      return res.status(401).json({
        Error: "Unauthorized access",
      });
    }
    const { id } = verified as { [Key: string]: string };
    // find user by Id
    const user = (await User.findOne({
      where: { id: id },
    })) as unknown as UserAttributes;
    if (!user) {
      return res.status(401).json({
        Error: "Unauthorized access",
      });
    }
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Unauthorized" });
  }
};