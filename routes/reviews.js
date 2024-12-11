import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        rating: true,
        comment: true,
        userId: true,
        propertyId: true,
      },
    });

    return res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews: ", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  const { rating, comment, userId, propertyId } = req.body;

  if (!rating || !comment || !userId || !propertyId) {
    console.log("Missing required fields: ", {
      rating,
      comment,
      userId,
      propertyId,
    });
    return res.status(400).json({
      message: "Rating, comment, user ID, and property ID are required",
    });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const propertyExists = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!propertyExists) {
      return res.status(404).json({ message: "Property not found" });
    }

    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        propertyId,
      },
    });

    return res.status(201).json(newReview);
  } catch (err) {
    console.error("Error creating review: ", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`Fetching review with ID: ${id}`);
    const review = await prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        rating: true,
        comment: true,
        userId: true,
        propertyId: true,
      },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json(review);
  } catch (err) {
    console.error("Error fetching review: ", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { rating, comment, userId, propertyId } = req.body;

  if (!rating && !comment && !userId && !propertyId) {
    return res.status(400).json({
      message:
        "At least one field (rating, comment, userId, propertyId) is required",
    });
  }

  try {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const updatedData = {};
    if (rating) updatedData.rating = rating;
    if (comment) updatedData.comment = comment;
    if (userId) updatedData.userId = userId;
    if (propertyId) updatedData.propertyId = propertyId;

    const updatedReview = await prisma.review.update({
      where: { id },
      data: updatedData,
    });

    return res.status(200).json(updatedReview);
  } catch (err) {
    console.error("Error updating review: ", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedReview = await prisma.review.delete({
      where: { id },
    });

    return res.status(200).json({
      message: `Review with ID ${deletedReview.id} deleted successfully`,
    });
  } catch (err) {
    console.error("Error deleting review: ", err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Review not found" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
