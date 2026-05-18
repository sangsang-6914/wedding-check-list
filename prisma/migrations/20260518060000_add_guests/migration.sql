-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "side" TEXT NOT NULL DEFAULT 'groom',
    "relation" TEXT NOT NULL DEFAULT '',
    "attending" TEXT NOT NULL DEFAULT 'pending',
    "plus_count" INTEGER NOT NULL DEFAULT 0,
    "needs_meal" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guests_user_id_idx" ON "guests"("user_id");
