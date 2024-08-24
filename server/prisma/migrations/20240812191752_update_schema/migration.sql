/*
  Warnings:

  - You are about to drop the `_MessageToRoom` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roomId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_MessageToRoom" DROP CONSTRAINT "_MessageToRoom_A_fkey";

-- DropForeignKey
ALTER TABLE "_MessageToRoom" DROP CONSTRAINT "_MessageToRoom_B_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "roomId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_MessageToRoom";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
