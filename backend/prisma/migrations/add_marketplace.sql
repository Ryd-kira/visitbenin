-- Migration: add_marketplace_tables
-- npm run migrate:marketplace

CREATE TYPE "ProductCategory" AS ENUM ('nourriture','artisanat','vetements','beaute','electronique','services','autre');
CREATE TYPE "OrderStatus"     AS ENUM ('cart','pending','confirmed','shipped','delivered','cancelled');

CREATE TABLE "shops" (
  "id"           TEXT NOT NULL,
  "owner_id"     TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "slug"         TEXT NOT NULL,
  "description"  TEXT,
  "cover_image"  TEXT,
  "city"         TEXT NOT NULL,
  "address"      TEXT,
  "phone"        TEXT,
  "whatsapp"     TEXT,
  "is_verified"  BOOLEAN NOT NULL DEFAULT false,
  "is_published" BOOLEAN NOT NULL DEFAULT false,
  "rating"       DECIMAL(3,2) NOT NULL DEFAULT 0,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "shops_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "shops_slug_key"   UNIQUE ("slug"),
  CONSTRAINT "shops_owner_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE "products" (
  "id"             TEXT NOT NULL,
  "shop_id"        TEXT NOT NULL,
  "name"           TEXT NOT NULL,
  "slug"           TEXT NOT NULL,
  "description"    TEXT,
  "price"          INTEGER NOT NULL,
  "original_price" INTEGER,
  "unit"           TEXT NOT NULL DEFAULT 'unité',
  "stock"          INTEGER NOT NULL DEFAULT 0,
  "category"       "ProductCategory" NOT NULL,
  "images"         TEXT[] DEFAULT ARRAY[]::TEXT[],
  "tags"           TEXT[] DEFAULT ARRAY[]::TEXT[],
  "is_published"   BOOLEAN NOT NULL DEFAULT false,
  "is_featured"    BOOLEAN NOT NULL DEFAULT false,
  "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "products_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "products_slug_key"  UNIQUE ("slug"),
  CONSTRAINT "products_shop_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE
);

CREATE TABLE "orders" (
  "id"               TEXT NOT NULL,
  "user_id"          TEXT,
  "status"           "OrderStatus"   NOT NULL DEFAULT 'cart',
  "total_price"      INTEGER NOT NULL DEFAULT 0,
  "delivery_address" TEXT,
  "delivery_city"    TEXT,
  "contact_name"     TEXT,
  "contact_phone"    TEXT,
  "contact_email"    TEXT,
  "payment_method"   "PaymentMethod",
  "payment_status"   "PaymentStatus" NOT NULL DEFAULT 'unpaid',
  "payment_ref"      TEXT,
  "notes"            TEXT,
  "confirmed_at"     TIMESTAMP(3),
  "delivered_at"     TIMESTAMP(3),
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "orders_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "orders_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE TABLE "order_items" (
  "id"         TEXT NOT NULL,
  "order_id"   TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "quantity"   INTEGER NOT NULL DEFAULT 1,
  "unit_price" INTEGER NOT NULL,
  "subtotal"   INTEGER NOT NULL,

  CONSTRAINT "order_items_pkey"         PRIMARY KEY ("id"),
  CONSTRAINT "order_items_order_fkey"   FOREIGN KEY ("order_id")   REFERENCES "orders"("id") ON DELETE CASCADE,
  CONSTRAINT "order_items_product_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id")
);

CREATE INDEX "shops_owner_idx"      ON "shops"("owner_id");
CREATE INDEX "products_shop_idx"    ON "products"("shop_id");
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "orders_user_idx"      ON "orders"("user_id");
CREATE INDEX "orders_status_idx"    ON "orders"("status");
CREATE INDEX "order_items_order_idx" ON "order_items"("order_id");
