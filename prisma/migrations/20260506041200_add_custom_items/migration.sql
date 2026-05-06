-- CreateTable
CREATE TABLE "custom_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_items_user_id_category_id_idx" ON "custom_items"("user_id", "category_id");
