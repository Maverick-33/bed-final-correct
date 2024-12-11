import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const usersPath = path.join(__dirname, "../src/data", "users.json");
  const hostsPath = path.join(__dirname, "../src/data", "hosts.json");
  const propertiesPath = path.join(__dirname, "../src/data", "properties.json");
  const bookingsPath = path.join(__dirname, "../src/data", "bookings.json");
  const reviewsPath = path.join(__dirname, "../src/data", "reviews.json");
  const amenitiesPath = path.join(__dirname, "../src/data", "amenities.json");

  const users = JSON.parse(await fs.readFile(usersPath, "utf8")).users;
  const hosts = JSON.parse(await fs.readFile(hostsPath, "utf8")).hosts;
  const properties = JSON.parse(
    await fs.readFile(propertiesPath, "utf8")
  ).properties;
  const bookings = JSON.parse(await fs.readFile(bookingsPath, "utf8")).bookings;
  const reviews = JSON.parse(await fs.readFile(reviewsPath, "utf8")).reviews;
  const amenities = JSON.parse(
    await fs.readFile(amenitiesPath, "utf8")
  ).amenities;

  for (const amenity of amenities) {
    try {
      await prisma.amenity.upsert({
        where: { id: amenity.id },
        update: {},
        create: {
          id: amenity.id,
          name: amenity.name,
        },
      });
      console.log(`amenity ${amenity.name} upserted successfully.`);
    } catch (err) {
      console.error(`Failed to upsert amenity: ${amenity.name}`, err);
    }
  }

  for (const userData of users) {
    try {
      await prisma.user.upsert({
        where: { id: userData.id },
        update: {},
        create: {
          id: userData.id,
          username: userData.username,
          name: userData.name,
          password: userData.password,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          profilePicture: userData.profilePicture,
        },
      });
      console.log(`User ${userData.username} upserted successfully.`);
    } catch (err) {
      console.error(`Error upserting user ${userData.username}:`, err);
    }
  }

  for (const hostData of hosts) {
    try {
      await prisma.host.upsert({
        where: { id: hostData.id },
        update: {
          username: hostData.username,
          name: hostData.name,
          email: hostData.email,
          phoneNumber: hostData.phoneNumber,
          profilePicture: hostData.profilePicture,
          aboutMe: hostData.aboutMe,
        },
        create: {
          id: hostData.id,
          username: hostData.username,
          name: hostData.name,
          email: hostData.email,
          phoneNumber: hostData.phoneNumber,
          profilePicture: hostData.profilePicture,
          aboutMe: hostData.aboutMe,
        },
      });
      console.log(`Host ${hostData.username} upserted successfully.`);
    } catch (err) {
      console.error(
        `Error creating or updating host ${hostData.username}:`,
        err
      );
    }
  }

  for (const propertyData of properties) {
    try {
      await prisma.property.upsert({
        where: { id: propertyData.id },
        update: {
          title: propertyData.title,
          description: propertyData.description,
          location: propertyData.location,
          pricePerNight: parseFloat(propertyData.pricePerNight),
          bedroomCount: propertyData.bedroomCount || 0,
          bathRoomCount: propertyData.bathRoomCount || 1,
          maxGuestCount: propertyData.maxGuestCount || 1,
          rating: propertyData.rating || 0,
          Host: { connect: { id: propertyData.hostId } },
        },
        create: {
          id: propertyData.id,
          title: propertyData.title,
          description: propertyData.description,
          location: propertyData.location,
          pricePerNight: parseFloat(propertyData.pricePerNight),
          bedroomCount: propertyData.bedroomCount || 0,
          bathRoomCount: propertyData.bathRoomCount || 1,
          maxGuestCount: propertyData.maxGuestCount || 1,
          rating: propertyData.rating || 0,
          Host: { connect: { id: propertyData.hostId } },
        },
      });

      console.log(`Property ${propertyData.title} upserted successfully.`);
    } catch (err) {
      console.error(`Failed to upsert property: ${propertyData.title}`, err);
    }
  }

  for (const bookingData of bookings) {
    const startDate = new Date(bookingData.checkinDate);
    const endDate = new Date(bookingData.checkoutDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.log(
        `Invalid dates for booking: ${bookingData.id}. Start date or end date is missing or invalid.`
      );
      continue;
    }

    try {
      const existingBooking = await prisma.booking.findUnique({
        where: { id: bookingData.id },
      });

      if (existingBooking) {
        console.log(
          `Booking with ID: ${bookingData.id} already exists. Skipping.`
        );
        continue;
      }

      const userExists = await prisma.user.findUnique({
        where: { id: bookingData.userId },
      });
      const propertyExists = await prisma.property.findUnique({
        where: { id: bookingData.propertyId },
      });

      if (userExists && propertyExists) {
        await prisma.booking.create({
          data: {
            id: bookingData.id,
            startDate: startDate,
            endDate: endDate,
            userId: bookingData.userId,
            propertyId: bookingData.propertyId,
            numberOfGuests: bookingData.numberOfGuests,
            totalPrice: bookingData.totalPrice,
            bookingStatus: bookingData.bookingStatus,
          },
        });
        console.log(`Booking ${bookingData.id} created successfully.`);
      } else {
        if (!userExists) {
          console.log(
            `User not found for booking: ${bookingData.id}, User ID: ${bookingData.userId}`
          );
        }
        if (!propertyExists) {
          console.log(
            `Property not found for booking: ${bookingData.id}, Property ID: ${bookingData.propertyId}`
          );
        }
        console.log(
          `Skipping booking: ${bookingData.id}, user or property not found.`
        );
      }
    } catch (err) {
      console.error(`Failed to create booking: ${bookingData.id}`, err);
    }
  }

  for (const reviewData of reviews) {
    try {
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewData.id },
      });

      if (existingReview) {
        console.log(
          `Review with ID: ${reviewData.id} already exists. Skipping.`
        );
        continue;
      }

      const userExists = await prisma.user.findUnique({
        where: { id: reviewData.userId },
      });
      const propertyExists = await prisma.property.findUnique({
        where: { id: reviewData.propertyId },
      });

      if (userExists && propertyExists) {
        await prisma.review.create({
          data: {
            id: reviewData.id,
            rating: reviewData.rating,
            comment: reviewData.comment,
            userId: reviewData.userId,
            propertyId: reviewData.propertyId,
          },
        });
        console.log(`Review ${reviewData.id} created successfully.`);
      } else {
        console.log(
          `Skipping review ${reviewData.id}, user or property not found.`
        );
        if (!userExists) console.log(`User not found: ${reviewData.userId}`);
        if (!propertyExists)
          console.log(`Property not found: ${reviewData.propertyId}`);
      }
    } catch (err) {
      console.error(`Failed to create review: ${reviewData.id}`, err);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
