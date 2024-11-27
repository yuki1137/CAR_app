/*
  Warnings:

  - You are about to drop the column `arrivalTime` on the `AttendanceRecord` table. All the data in the column will be lost.
  - Added the required column `promisedTime` to the `AttendanceRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttendanceRecord" DROP COLUMN "arrivalTime",
ADD COLUMN     "promisedTime" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "attendanceTime" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "promisedTime" DROP NOT NULL;
