/*
  Warnings:

  - You are about to drop the column `latestPromisedtime` on the `AttendanceRecord` table. All the data in the column will be lost.
  - Added the required column `latestPromisedTime` to the `AttendanceRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttendanceRecord" DROP COLUMN "latestPromisedtime",
ADD COLUMN     "latestPromisedTime" TIMESTAMP(3) NOT NULL;
