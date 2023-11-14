import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

import { validationSchema, option, loginSchema } from "../utils/index";
import { UserAttributes, UserInstance } from "../models/userModel";
import { v4 as uuidv4 } from "uuid";
import jwt, { JwtPayload } from "jsonwebtoken";
import { App_secret, Expiry } from "../config";

// Register new user

export const Register = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const { email, password, firstName, lastName } = req.body;

    const validateResult = validationSchema.validate(req.body, option);
    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    //Generate salt
    const salt = await bcrypt.genSalt();
    const userPassword = await bcrypt.hash(password, salt);

    //check if the user exist
    const User = await UserInstance.findOne({ where: { email } });

    //Create User
    if (!User) {
      await UserInstance.create({
        id: id,
        email,
        password: userPassword,
        firstName,
        lastName,
        role: "user",
      });

      //Check if the registered user exist
      const User = (await UserInstance.findOne({
        where: { email: email },
      })) as unknown as UserAttributes;

      //Generate signature for user
      const signature = jwt.sign(
        { id: User.id, email: User.email },
        App_secret,
        { expiresIn: Expiry }
      );

      return res.status(201).json({
        msg: "User created successfully",
        signature,
        User,
      });
    } else {
      return res.status(400).json({
        msg: "User already exist",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      Error: error.message,
      route: "/signup",
    });
  }
};

// Login a user

export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const validateResult = loginSchema.validate(req.body, option);
    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    //check if the user exist
    const User = (await UserInstance.findOne({
      where: { email },
    })) as unknown as UserAttributes;
    if (!User) {
      return res.status(404).json({
        msg: "User not found",
      });
    }
    const validPassword = await bcrypt.compare(password, User.password);

    if (validPassword === false) {
      return res.status(404).json({
        msg: "Password incorrect",
      });
    }

    //Generate signature for user
    const signature = jwt.sign({ id: User.id, email: User.email }, App_secret, {
      expiresIn: Expiry,
    });

    return res.status(201).json({
      msg: "Login successfully",
      signature,
    });
  } catch (error: any) {
    res.status(500).json({
      Error: error.message,
      route: "/login",
    });
  }
};

// All users

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserInstance.findAndCountAll();
    return res.status(200).json({
      message: "You have successfully retrieved all users",
      Count: users.count,
      Users: users.rows,
    });
  } catch (err: any) {
    return res.status(500).json({
      Error: err.message,
      route: "/get-all-users",
    });
  }
};

// Update user profile

export const UpdateUserProfile = async (req: JwtPayload, res: Response) => {
  try {
    const { id } = req.user;
  } catch (error: any) {
    return res.status(500).json({
      Error: error.message,
      route: "/update",
    });
  }
};

// Get a user profile

export const userProfile = async (req: JwtPayload, res: Response) => {
  try {
    const { id } = req.user;

    const user = await UserInstance.findOne({ where: { id },  attributes: {
      exclude: ['password'],
    }, }) as unknown as UserAttributes;

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      msg: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      Error: error.message,
      route: "/my-profile",
    });
  }
};

// Remove a user profile

export const removeProfile = async (req: JwtPayload, res: Response) => {
  try {
    const { id } = req.user;

    const user = await UserInstance.findOne({ where: { id },  attributes: {
      exclude: ['password'],
    }, }) as unknown as UserAttributes;

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    await UserInstance.destroy({where: {id}})

    return res.status(200).json({
      msg: "Your profile as been removed from the database",
    });
  } catch (error: any) {
    return res.status(500).json({
      Error: error.message,
      route: "/my-profile",
    });
  }
};
