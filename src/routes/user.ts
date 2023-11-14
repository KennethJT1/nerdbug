import express from "express";
import { Register, Login, getAllUsers, UpdateUserProfile, userProfile, removeProfile } from "../controllers/userCtrl";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

router.post("/signup", Register);
router.post("/login", Login);
router.get("/get-all-users", getAllUsers);
router.patch("/update", authMiddleware, UpdateUserProfile);
router.get("/my-profile", authMiddleware, userProfile);
router.delete("/remove", authMiddleware, removeProfile);

export default router;
