-- CreateTable
CREATE TABLE "Amenity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "numberOfGuests" INTEGER NOT NULL,
    "totalPrice" REAL NOT NULL,
    "bookingStatus" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "profilePicture" TEXT,
    "aboutMe" TEXT
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "pricePerNight" REAL NOT NULL,
    "bedroomCount" INTEGER NOT NULL,
    "bathRoomCount" INTEGER NOT NULL,
    "maxGuestCount" INTEGER NOT NULL,
    "rating" REAL NOT NULL,
    "hostId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" REAL NOT NULL,
    "comment" TEXT,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "profilePicture" TEXT
);

-- CreateTable
CREATE TABLE "_PropertyAmenities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Booking_propertyId_idx" ON "Booking"("propertyId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Host_username_key" ON "Host"("username");

-- CreateIndex
CREATE INDEX "Property_hostId_idx" ON "Property"("hostId");

-- CreateIndex
CREATE INDEX "Review_propertyId_idx" ON "Review"("propertyId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "_PropertyAmenities_AB_unique" ON "_PropertyAmenities"("A", "B");

-- CreateIndex
CREATE INDEX "_PropertyAmenities_B_index" ON "_PropertyAmenities"("B");
