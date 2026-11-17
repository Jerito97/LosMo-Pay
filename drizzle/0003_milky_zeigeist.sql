ALTER TABLE "users" ALTER COLUMN "pin_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_token_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_token_expires_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_idx" ON "users" USING btree (lower("email"));