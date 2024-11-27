/*
  Warnings:

  - Made the column `attendanceTime` on table `Attendance` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "attendanceTime" SET NOT NULL;
