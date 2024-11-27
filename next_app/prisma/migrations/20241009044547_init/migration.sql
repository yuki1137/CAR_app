/*
  Warnings:

  - Added the required column `latestPromisedtime` to the `AttendanceRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttendanceRecord" ADD COLUMN     "latestPromisedtime" TIMESTAMP(3) NOT NULL;
