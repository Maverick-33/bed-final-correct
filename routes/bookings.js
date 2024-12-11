import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const { userId } = req.query;

  try {
    const filters = {};

    if (userId) {
      filters.userId = userId;
    }

    console.log("Filters: ", filters);

    const bookings = await prisma.booking.findMany({
      where: filters,
      select: {
        id: true,
        startDate: true,
        endDate: true,
        userId: true,
        propertyId: true,
      },
    });

    console.log("Bookings: ", bookings);

    return res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings: ", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  const {
    numberOfGuests,
    checkinDate,
    checkoutDate,
    userId,
    propertyId,
    totalPrice,
    bookingStatus,
  } = req.body;

  const startDate = new Date(checkinDate);
  const endDate = new Date(checkoutDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res.status(400).json({
      message:
        "Invalid checkinDate or checkoutDate. Please provide valid dates.",
    });
  }

  if (!userId || !propertyId) {
    return res.status(400).json({
      message: "userId and propertyId are required.",
    });
  }

  if (numberOfGuests && (isNaN(numberOfGuests) || numberOfGuests <= 0)) {
    return res.status(400).json({
      message: "numberOfGuests must be a positive integer.",
    });
  }

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      return res.status(404).json({ message: "User not found." });
    }

    const propertyExists = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!propertyExists) {
      return res.status(404).json({ message: "Property not found." });
    }

    const newBooking = await prisma.booking.create({
      data: {
        startDate,
        endDate,
        userId,
        propertyId,
        numberOfGuests: numberOfGuests || 1,
        totalPrice,
        bookingStatus,
      },
    });

    return res.status(201).json(newBooking);
  } catch (err) {
    console.error("Error creating booking: ", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`Fetching booking with ID: ${id}`);

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        userId: true,
        propertyId: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json(booking);
  } catch (err) {
    console.error("Error fetching booking: ", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    checkinDate,
    checkoutDate,
    numberOfGuests,
    totalPrice,
    bookingStatus,
    userId,
    propertyId,
  } = req.body;

  if (
    !checkinDate &&
    !checkoutDate &&
    !numberOfGuests &&
    !totalPrice &&
    !bookingStatus &&
    !userId &&
    !propertyId
  ) {
    return res.status(400).json({
      message:
        "At least one field (checkinDate, checkoutDate, numberOfGuests, totalPrice, bookingStatus, userId, propertyId) is required",
    });
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const updatedData = {};

    if (checkinDate) updatedData.startDate = new Date(checkinDate);
    if (checkoutDate) updatedData.endDate = new Date(checkoutDate);
    if (numberOfGuests) updatedData.numberOfGuests = numberOfGuests;
    if (totalPrice) updatedData.totalPrice = totalPrice;
    if (bookingStatus) updatedData.bookingStatus = bookingStatus;
    if (userId) updatedData.userId = userId;
    if (propertyId) updatedData.propertyId = propertyId;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updatedData,
    });

    return res.status(200).json(updatedBooking);
  } catch (err) {
    console.error("Error updating booking: ", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const bookingExists = await prisma.booking.findUnique({
      where: { id },
    });

    if (!bookingExists) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const deletedBooking = await prisma.booking.delete({
      where: { id },
    });

    return res.status(200).json({
      message: `Booking ${deletedBooking.id} deleted successfully`,
    });
  } catch (err) {
    console.error("Error deleting booking: ", err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
