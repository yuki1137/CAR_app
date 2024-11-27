/*
  Warnings:

  - You are about to drop the column `attendanceTime` on the `AttendanceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `promisedTime` on the `AttendanceRecord` table. All the data in the column will be lost.
  - Added the required column `attendanceId` to the `AttendanceRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttendanceRecord" DROP COLUMN "attendanceTime",
DROP COLUMN "promisedTime",
ADD COLUMN     "attendanceId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
