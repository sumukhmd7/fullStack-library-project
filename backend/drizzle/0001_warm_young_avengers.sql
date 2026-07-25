CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "book_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" varchar(20),
	"message" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review" text,
	"rating" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rating_check" CHECK ("reviews"."rating" BETWEEN 1 AND 10)
);
