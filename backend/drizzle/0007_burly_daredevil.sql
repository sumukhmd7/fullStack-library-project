CREATE TABLE "borrowed_books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"borrowed_at" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp,
	"returned_at" timestamp,
	"fine" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "borrowed_books" ADD CONSTRAINT "borrowed_books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrowed_books" ADD CONSTRAINT "borrowed_books_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "books" DROP COLUMN "book_category";--> statement-breakpoint
-- ALTER TABLE "books" DROP COLUMN "current_owner";--> statement-breakpoint
-- ALTER TABLE "users" DROP COLUMN "borrow_books";