import supertest from "supertest";
import { db1 as db } from "../config/index";
import { app } from "../app";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  Login,
  Register,
  UpdateUserProfile,
  getAllUsers,
  removeProfile,
  userProfile,
} from "../controllers/userCtrl";
import { UserInstance, UserAttributes } from "../models/userModel";

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "fakeToken"),
}));

jest.mock("bcrypt", () => ({
  genSalt: jest.fn(() => "fakeSalt"),
  hash: jest.fn(() => "fakeHash"),
}));

/// MYYYYYYYYYYYYY
const request = supertest(app);

beforeAll(async () => {
  await db.sync().then(() => {
    console.log("DB connected successfully");
  });
});

describe("USER REGISTRATION", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD handle registration when the user already exists", async () => {
    const mockRequest = {
      body: {
        email: "existing@example.com",
        password: "password123",
        firstName: "Jane",
        lastName: "Doe",
      },
    };

    const mockResponse: any = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };

    // Mocking findOne to return an existing user
    UserInstance.findOne = jest.fn().mockResolvedValue({
      id: "existingUserId",
      email: "existing@example.com",
      password: "fakeHash",
      firstName: "Jane",
      lastName: "Doe",
      role: "user",
    } as unknown as UserAttributes);

    await Register(mockRequest as any, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: "User already exist",
    });
  });

  it("SHOULD handle validation error", async () => {
    const mockRequest = {
      body: {
        // Invalid data that triggers validation error
        email: "invalid-email",
        password: "short",
        firstName: "",
        lastName: "",
      },
    };

    const mockResponse: any = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };

    await Register(mockRequest as any, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      Error: expect.any(String), // The actual error message
    });
  });

  it("SHOULD handle internal server error", async () => {
    const mockRequest = {
      body: {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      },
    };

    const mockResponse: any = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };

    // Mocking findOne to throw an error
    UserInstance.findOne = jest
      .fn()
      .mockRejectedValue(new Error("Internal Server Error"));

    await Register(mockRequest as any, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      Error: "Internal Server Error",
      route: "/signup",
    });
  });
});

describe("USER LOGIN", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD log in successfully", async () => {
    const mockRequest = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };

    const mockResponse: any = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };

    // Mocking findOne to return a user
    UserInstance.findOne = jest.fn().mockResolvedValue({
      id: "fakeUserId",
      email: "test@example.com",
      password: "fakeHash", // hashed password
      firstName: "John",
      lastName: "Doe",
      role: "user",
    } as unknown as UserAttributes);

    // Mocking bcrypt.compare to return true, indicating a valid password
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    // Mocking jwt.sign to return a fake token
    jwt.sign = jest.fn().mockReturnValue("fakeToken");

    await Login(mockRequest as any, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: "Login successfully",
      signature: "fakeToken",
    });
  });

  it("SHOULD handle user not found", async () => {
    const mockRequest = {
      body: {
        email: "nonexistent@example.com",
        password: "password123",
      },
    };

    const mockResponse: any = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };

    // Mocking findOne to return null, indicating that the user doesn't exist
    UserInstance.findOne = jest.fn().mockResolvedValue(null);

    await Login(mockRequest as any, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: "User not found",
    });
  });

  it("SHOULD handle password incorrect", async () => {
    const mockRequest = {
      body: {
        email: "test@example.com",
        password: "incorrectPassword",
      },
    };

    const mockResponse: any = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };

    // Mocking findOne to return a user
    UserInstance.findOne = jest.fn().mockResolvedValue({
      id: "fakeUserId",
      email: "test@example.com",
      password: "fakeHash", // hashed password
      firstName: "John",
      lastName: "Doe",
      role: "user",
    } as unknown as UserAttributes);

    // Mocking bcrypt.compare to return false, indicating an incorrect password
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    await Login(mockRequest as any, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: "Password incorrect",
    });
  });

  it("SHOULD handle validation error", async () => {
    const mockRequest = {
      body: {
        // Invalid data that triggers validation error
        email: "invalid-email",
        password: "",
      },
    };

    const mockResponse: any = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };

    await Login(mockRequest as any, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      Error: expect.any(String), // The actual error message
    });
  });

  it("SHOULD handle internal server error", async () => {
    const mockRequest = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };

    const mockResponse: any = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };

    // Mocking findOne to throw an error
    UserInstance.findOne = jest
      .fn()
      .mockRejectedValue(new Error("Internal Server Error"));

    await Login(mockRequest as any, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      Error: "Internal Server Error",
      route: "/login",
    });
  });
});

describe("GET ALL USERS", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD retrieve all users successfully", async () => {
    const mockRequest = {};
    const mockResponse: any = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };

    // Mocking findAndCountAll to return sample users
    UserInstance.findAndCountAll = jest.fn().mockResolvedValue({
      count: 2,
      rows: [
        {
          id: "user1",
          email: "user1@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "user",
        },
        {
          id: "user2",
          email: "user2@example.com",
          firstName: "Jane",
          lastName: "Doe",
          role: "user",
        },
      ],
    });

    await getAllUsers(mockRequest as any, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "You have successfully retrieved all users",
      Count: 2,
      Users: [
        {
          id: "user1",
          email: "user1@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "user",
        },
        {
          id: "user2",
          email: "user2@example.com",
          firstName: "Jane",
          lastName: "Doe",
          role: "user",
        },
      ],
    });
  });

  it("SHOULD handle internal server error", async () => {
    const mockRequest = {};
    const mockResponse: any = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };

    // Mocking findAndCountAll to throw an error
    UserInstance.findAndCountAll = jest
      .fn()
      .mockRejectedValue(new Error("Internal Server Error"));

    await getAllUsers(mockRequest as any, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      Error: "Internal Server Error",
      route: "/get-all-users",
    });
  });
});

describe("UPDATE USER PROFILE", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should handle user not found", async () => {
    const mockRequest = {
      user: {
        id: "nonexistentUserId",
      },
      body: {
        firstName: "NewFirstName",
        lastName: "NewLastName",
      },
    } as unknown as Request;

    const mockResponse: Response = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    } as unknown as Response;

    // Mocking findOne to return null, indicating that the user doesn't exist
    UserInstance.findOne = jest.fn().mockResolvedValue(null);

    await UpdateUserProfile(mockRequest, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "User not found",
    });
  });

  it("should handle internal server error", async () => {
    const mockRequest = {
      user: {
        id: "fakeUserId",
      },
      body: {
        firstName: "NewFirstName",
        lastName: "NewLastName",
      },
    } as unknown as Request;

    const mockResponse: Response = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    } as unknown as Response;

    // Mocking findOne to throw an error
    UserInstance.findOne = jest
      .fn()
      .mockRejectedValue(new Error("Internal Server Error"));

    await UpdateUserProfile(mockRequest, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      Error: "Internal Server Error",
      route: "/update",
    });
  });
});

describe("USER PROFILE", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get user profile", async () => {
    const mockRequest = {
      user: {
        id: "fakeUserId",
      },
    } as unknown as Request;

    const mockResponse: Response = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    } as unknown as Response;

    // Mocking findOne to return an existing user
    UserInstance.findOne = jest.fn().mockResolvedValue({
      id: "fakeUserId",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "user",
    } as unknown as UserAttributes);

    await userProfile(mockRequest, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: {
        id: "fakeUserId",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "user",
      },
    });
  });

  it("should handle user not found", async () => {
    const mockRequest = {
      user: {
        id: "nonExistentUserId",
      },
    } as unknown as Request;

    const mockResponse: Response = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    } as unknown as Response;

    // Mocking findOne to return null, indicating that the user doesn't exist
    UserInstance.findOne = jest.fn().mockResolvedValue(null);

    await userProfile(mockRequest, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "User not found",
    });
  });

  it("should handle internal server error", async () => {
    const mockRequest = {
      user: {
        id: "fakeUserId",
      },
    } as unknown as Request;

    const mockResponse: Response = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    } as unknown as Response;

    // Mocking findOne to throw an error
    UserInstance.findOne = jest
      .fn()
      .mockRejectedValue(new Error("Internal Server Error"));

    await userProfile(mockRequest, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      Error: "Internal Server Error",
      route: "/my-profile",
    });
  });
});

describe("REMOVE USER PROFILE", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should remove user profile", async () => {
    const mockRequest = {
      user: {
        id: "fakeUserId",
      },
    } as unknown as Request;

    const mockResponse: Response = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    } as unknown as Response;

    // Mocking findOne to return an existing user
    UserInstance.findOne = jest.fn().mockResolvedValue({
      id: "fakeUserId",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "user",
    } as unknown as UserAttributes);

    // Mocking destroy to return a successful removal
    UserInstance.destroy = jest.fn().mockResolvedValue(1);

    await removeProfile(mockRequest, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it("should handle user not found", async () => {
    const mockRequest = {
      user: {
        id: "nonExistentUserId",
      },
    } as unknown as Request;

    const mockResponse: Response = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    } as unknown as Response;

    // Mocking findOne to return null, indicating that the user doesn't exist
    UserInstance.findOne = jest.fn().mockResolvedValue(null);

    await removeProfile(mockRequest, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "User not found",
    });
  });

  it("should handle internal server error", async () => {
    const mockRequest = {
      user: {
        id: "fakeUserId",
      },
    } as unknown as Request;

    const mockResponse: Response = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    } as unknown as Response;

    // Mocking findOne to return an existing user
    UserInstance.findOne = jest.fn().mockResolvedValue({
      id: "fakeUserId",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "user",
    } as unknown as UserAttributes);

    // Mocking destroy to throw an error
    UserInstance.destroy = jest
      .fn()
      .mockRejectedValue(new Error("Internal Server Error"));

    await removeProfile(mockRequest, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      Error: "Internal Server Error",
      route: "/remove",
    });
  });
});
