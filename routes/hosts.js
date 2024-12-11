import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const { name } = req.query;

  try {
    const filters = {};

    if (name) {
      filters.username = { contains: name, mode: "insensitive" };
    }

    const hosts = await prisma.host.findMany({
      where: filters,
      select: {
        id: true,
        username: true,
        email: true,
        aboutMe: true,
      },
    });

    return res.status(200).json(hosts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  const { username, name, email, phoneNumber, profilePicture, aboutMe } =
    req.body;

  if (!username || !name || !phoneNumber) {
    return res
      .status(400)
      .json({ message: "Username, name, and phoneNumber are required" });
  }

  try {
    const newHost = await prisma.host.upsert({
      where: { username },
      update: {
        name,
        email,
        phoneNumber,
        profilePicture,
        aboutMe,
      },
      create: {
        username,
        name,
        email,
        phoneNumber,
        profilePicture,
        aboutMe,
      },
    });

    return res.status(201).json({
      message: "Host created or updated successfully",
      host: newHost,
    });
  } catch (err) {
    console.error("Error upserting host:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const host = await prisma.host.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        aboutMe: true,
      },
    });

    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    return res.status(200).json(host);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { username, email, aboutMe } = req.body;

  if (!username && !email && !aboutMe) {
    return res.status(400).json({
      message: "At least one field (username, email, or aboutMe) is required",
    });
  }

  try {
    const host = await prisma.host.findUnique({ where: { id } });

    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    const updatedData = {};
    if (username) updatedData.username = username;
    if (email) updatedData.email = email;
    if (aboutMe) updatedData.aboutMe = aboutMe;

    const updatedHost = await prisma.host.update({
      where: { id },
      data: updatedData,
    });

    return res.status(200).json(updatedHost);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const hostExists = await prisma.host.findUnique({ where: { id } });
    if (!hostExists) {
      return res.status(404).json({ message: "Host not found" });
    }

    await prisma.property.deleteMany({
      where: { hostId: id },
    });

    const deletedHost = await prisma.host.delete({
      where: { id },
    });

    return res.status(200).json({
      message: `Host ${deletedHost.username} and associated properties deleted successfully`,
    });
  } catch (err) {
    console.error("Error deleting host: ", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
