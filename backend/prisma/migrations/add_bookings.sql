-- Migration: add_bookings_table
-- À exécuter dans psql ou via prisma migrate deploy

CREATE TYPE "BookingType" AS ENUM ('hotel','restaurant','activity','guide');
CREATE TYPE "BookingStatus" AS ENUM ('pending','confirmed','cancelled','completed');
CREATE TYPE "PaymentMethod" AS ENUM ('mtn_money','moov_money','card','cash');
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid','paid','refunded');

CREATE TABLE "bookings" (
  "id"              TEXT NOT NULL,
  "user_id"         TEXT NOT NULL,
  "booking_type"    "BookingType" NOT NULL,
  "entity_id"       TEXT NOT NULL,
  "entity_name"     TEXT NOT NULL,
  "date"            TIMESTAMP(3) NOT NULL,
  "time_slot"       TEXT,
  "nb_persons"      INTEGER NOT NULL DEFAULT 1,
  "total_price"     INTEGER NOT NULL,
  "currency"        TEXT NOT NULL DEFAULT 'XOF',
  "status"          "BookingStatus" NOT NULL DEFAULT 'pending',
  "payment_method"  "PaymentMethod",
  "payment_status"  "PaymentStatus" NOT NULL DEFAULT 'unpaid',
  "payment_ref"     TEXT,
  "notes"           TEXT,
  "contact_name"    TEXT NOT NULL,
  "contact_phone"   TEXT NOT NULL,
  "contact_email"   TEXT NOT NULL,
  "confirmed_at"    TIMESTAMP(3),
  "cancelled_at"    TIMESTAMP(3),
  "cancel_reason"   TEXT,
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "bookings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");
CREATE INDEX "bookings_status_idx"  ON "bookings"("status");
CREATE INDEX "bookings_date_idx"    ON "bookings"("date");
