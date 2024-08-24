-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomUser" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MessageToRoom" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MessageToRoom_AB_unique" ON "_MessageToRoom"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageToRoom_B_index" ON "_MessageToRoom"("B");

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToRoom" ADD CONSTRAINT "_MessageToRoom_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToRoom" ADD CONSTRAINT "_MessageToRoom_B_fkey" FOREIGN KEY ("B") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
