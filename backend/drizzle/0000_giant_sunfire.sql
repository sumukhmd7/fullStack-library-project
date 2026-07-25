CREATE TABLE IF NOT EXISTS "books"  (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_name" varchar(255) NOT NULL,
	"book_description" text NOT NULL,
	"book_author" varchar(255) NOT NULL,
	"book_category" varchar(100) DEFAULT 'common',
	"book_image" text NOT NULL,
	"book_status" text DEFAULT 'available',
	"book_cost" integer NOT NULL,
	"book_likes" integer DEFAULT 0,
	"like_by_users" uuid[],
	"current_owner" uuid,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_name" text NOT NULL,
	"user_phone" integer NOT NULL,
	"user_email" text NOT NULL,
	"user_password" text NOT NULL,
	"user_address" text NOT NULL,
	"user_profile_pic" text NOT NULL,
	"user_gender" text NOT NULL,
	"borrow_books" json DEFAULT '[]'::json,
	"used_passwords" json DEFAULT '[]'::json,
	"user_role" text DEFAULT 'user',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
