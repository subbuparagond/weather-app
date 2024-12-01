ALTER TABLE "user_favorite_cities" DROP CONSTRAINT "user_favorite_cities_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_favorite_cities" DROP CONSTRAINT "user_favorite_cities_city_id_cities_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_favorite_cities" ADD CONSTRAINT "user_favorite_cities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_favorite_cities" ADD CONSTRAINT "user_favorite_cities_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "cities" DROP COLUMN IF EXISTS "created_at";--> statement-breakpoint
ALTER TABLE "user_favorite_cities" DROP COLUMN IF EXISTS "created_at";