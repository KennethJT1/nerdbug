import { Model, DataTypes } from "sequelize";
import { db } from "../config";

// Defining UserAttributes interface
export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Defining UserInstance model
export class UserInstance extends Model<UserAttributes> {}

// Initializing UserInstance model with attributes
UserInstance.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: "Email address is required",
        },
        isEmail: {
          msg: "Please provide a valid email",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Password is required",
        },
        notEmpty: {
          msg: "Provide a password",
        },
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "First name is required",
        },
        notEmpty: {
          msg: "Provide your first name",
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Last name is required",
        },
        notEmpty: {
          msg: "Provide your last name",
        },
      },
    },
    role: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: db,
    tableName: "user",
  }
);
