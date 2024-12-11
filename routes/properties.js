import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const { location, pricePerNight, amenities } = req.query;

  try {
    const filters = {};

    if (location) {
      filters.location = { contains: location, mode: "insensitive" };
    }

    if (pricePerNight) {
      filters.pricePerNight = { equals: parseFloat(pricePerNight) };
    }

    if (amenities) {
      const amenitiesArray = amenities.split(",");
      filters.amenities = {
        some: {
          name: { in: amenitiesArray },
        },
      };
    }

    const properties = await prisma.property.findMany({
      where: filters,
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        pricePerNight: true,
        bedroomCount: true,
        bathRoomCount: true,
        maxGuestCount: true,
        rating: true,
        hostId: true,
      },
    });

    return res.status(200).json(properties);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  const {
    title,
    description,
    location,
    pricePerNight,
    bedroomCount,
    bathRoomCount,
    maxGuestCount,
    rating,
    hostId,
  } = req.body;

  if (
    !title ||
    !description ||
    !location ||
    !pricePerNight ||
    !bedroomCount ||
    !bathRoomCount ||
    !maxGuestCount ||
    !rating ||
    !hostId
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hostExists = await prisma.host.findUnique({
      where: { id: hostId },
    });

    if (!hostExists) {
      return res.status(404).json({ message: "Host not found" });
    }

    const newProperty = await prisma.property.create({
      data: {
        title,
        description,
        location,
        pricePerNight,
        bedroomCount,
        bathRoomCount,
        maxGuestCount,
        rating,
        hostId,
      },
    });

    return res.status(201).json(newProperty);
  } catch (err) {
    console.error("Error creating property:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        pricePerNight: true,
        bedroomCount: true,
        bathRoomCount: true,
        maxGuestCount: true,
        rating: true,
        hostId: true,
      },
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    return res.status(200).json(property);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    location,
    pricePerNight,
    bedroomCount,
    bathRoomCount,
    maxGuestCount,
    rating,
    hostId,
  } = req.body;

  try {
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const updatedData = {};
    if (title) updatedData.title = title;
    if (description) updatedData.description = description;
    if (location) updatedData.location = location;
    if (pricePerNight) updatedData.pricePerNight = pricePerNight;
    if (bedroomCount) updatedData.bedroomCount = bedroomCount;
    if (bathRoomCount) updatedData.bathRoomCount = bathRoomCount;
    if (maxGuestCount) updatedData.maxGuestCount = maxGuestCount;
    if (rating) updatedData.rating = rating;
    if (hostId) updatedData.hostId = hostId;

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updatedData,
    });

    return res.status(200).json(updatedProperty);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.booking.deleteMany({
      where: { propertyId: id },
    });

    const deletedProperty = await prisma.property.delete({
      where: { id },
    });

    return res.status(200).json({
      message: `Property ${deletedProperty.title} deleted successfully`,
    });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Property not found" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
