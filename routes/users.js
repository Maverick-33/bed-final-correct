import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phoneNumber: true,
        profilePicture: true,
      },
    });

    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phoneNumber: true,
        profilePicture: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  const { username, email, password, name, phoneNumber, profilePicture } =
    req.body;

  if (!username || !email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Username, email, password, and name are required" });
  }

  try {
    const newUser = await prisma.user.upsert({
      where: { username },
      update: {
        email,
        password,
        name,
        phoneNumber,
        profilePicture,
      },
      create: {
        username,
        email,
        password,
        name,
        phoneNumber,
        profilePicture,
      },
    });

    return res.status(201).json({
      message: "User created or updated successfully",
      user: newUser,
    });
  } catch (err) {
    console.error("Error upserting user:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { username, email, name, phoneNumber, profilePicture } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { id } });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { username, email, name, phoneNumber, profilePicture },
      select: {
        username: true,
        email: true,
        name: true,
        phoneNumber: true,
        profilePicture: true,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const userExists = await prisma.user.findUnique({ where: { id } });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.review.deleteMany({
      where: { userId: id },
    });

    const deletedUser = await prisma.user.delete({ where: { id } });

    return res
      .status(200)
      .json({ message: `User ${deletedUser.username} deleted successfully` });
  } catch (err) {
    console.error(err);

    if (err.code === "P2003") {
      return res.status(400).json({
        message: "Unable to delete user due to foreign key constraints",
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
