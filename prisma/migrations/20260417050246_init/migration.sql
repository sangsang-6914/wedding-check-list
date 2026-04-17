-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "checklist_items_user_id_idx" ON "checklist_items"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_items_user_id_item_id_key" ON "checklist_items"("user_id", "item_id");
