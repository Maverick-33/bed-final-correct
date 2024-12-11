import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const amenities = await prisma.amenity.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(200).json(amenities);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "id and name are required" });
  }
  try {
    const newAmenity = await prisma.amenity.create({
      data: {
        name,
      },
    });

    if (!newAmenity) {
      return res.status(404).json({ message: "Amenity not found" });
    }

    return res.status(201).json(newAmenity);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const amenity = await prisma.amenity.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!amenity) {
      return res.status(404).json({ message: "Amenity not found" });
    }

    return res.status(200).json(amenity);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name && !id) {
    return res.status(400).json({
      message: "At least one field (name or id) is required",
    });
  }

  try {
    const amenity = await prisma.amenity.findUnique({ where: { id } });

    if (!amenity) {
      return res.status(404).json({ message: "Amenity not found" });
    }

    const updatedData = {};
    if (name) updatedData.name = name;
    if (id) updatedData.id = id;

    const updatedAmenity = await prisma.amenity.update({
      where: { id },
      data: updatedData,
    });

    return res.status(200).json(updatedAmenity);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAmenity = await prisma.amenity.delete({
      where: { id },
    });

    return res.status(200).json({
      message: `Amenity ${deletedAmenity.id} deleted successfully`,
    });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Amenity not found" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
