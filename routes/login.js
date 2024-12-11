import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT Secret not defined" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7h" }
    );

    return res.status(200).json({ token });
  } catch (err) {
    console.error("Error occurred during login: ", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
