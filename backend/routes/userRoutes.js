import express from "express";
import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserById,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getAllUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/:id", getUserById);

export default router;
