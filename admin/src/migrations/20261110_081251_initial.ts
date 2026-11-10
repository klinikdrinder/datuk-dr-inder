import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'datuk_cms') THEN CREATE SCHEMA "datuk_cms"; END IF; END $$;`)
  await db.execute(sql`
   CREATE TYPE "datuk_cms"."enum_events_role" AS ENUM('Speaker', 'Faculty', 'Organiser', 'Award', 'Guest', 'Media', 'Attendee');
  CREATE TYPE "datuk_cms"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "datuk_cms"."enum__events_v_version_role" AS ENUM('Speaker', 'Faculty', 'Organiser', 'Award', 'Guest', 'Media', 'Attendee');
  CREATE TYPE "datuk_cms"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "datuk_cms"."enum_seminars_registration_mode" AS ENUM('form', 'whatsapp', 'external', 'closed');
  CREATE TYPE "datuk_cms"."enum_seminars_status" AS ENUM('draft', 'published');
  CREATE TYPE "datuk_cms"."enum__seminars_v_version_registration_mode" AS ENUM('form', 'whatsapp', 'external', 'closed');
  CREATE TYPE "datuk_cms"."enum__seminars_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "datuk_cms"."enum_seminar_registrations_status" AS ENUM('registered', 'confirmed', 'attended', 'cancelled');
  CREATE TYPE "datuk_cms"."enum_enquiries_status" AS ENUM('new', 'contacted', 'booked', 'closed');
  CREATE TYPE "datuk_cms"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "datuk_cms"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "datuk_cms"."enum_users_role" AS ENUM('admin', 'editor', 'author');
  CREATE TABLE "datuk_cms"."events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"city" varchar,
  	"country" varchar DEFAULT 'Malaysia',
  	"role" "datuk_cms"."enum_events_role" DEFAULT 'Speaker',
  	"highlight" varchar,
  	"summary" varchar,
  	"seminar_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "datuk_cms"."enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "datuk_cms"."events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "datuk_cms"."_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_city" varchar,
  	"version_country" varchar DEFAULT 'Malaysia',
  	"version_role" "datuk_cms"."enum__events_v_version_role" DEFAULT 'Speaker',
  	"version_highlight" varchar,
  	"version_summary" varchar,
  	"version_seminar_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "datuk_cms"."enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "datuk_cms"."_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "datuk_cms"."seminars" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"venue" varchar,
  	"is_online" boolean DEFAULT false,
  	"online_link" varchar,
  	"summary" varchar,
  	"description" jsonb,
  	"poster_id" integer,
  	"fee" varchar DEFAULT 'Free',
  	"capacity" numeric,
  	"registration_mode" "datuk_cms"."enum_seminars_registration_mode" DEFAULT 'form',
  	"external_url" varchar,
  	"slug" varchar,
  	"publish_at" timestamp(3) with time zone,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "datuk_cms"."enum_seminars_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "datuk_cms"."_seminars_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_ends_at" timestamp(3) with time zone,
  	"version_venue" varchar,
  	"version_is_online" boolean DEFAULT false,
  	"version_online_link" varchar,
  	"version_summary" varchar,
  	"version_description" jsonb,
  	"version_poster_id" integer,
  	"version_fee" varchar DEFAULT 'Free',
  	"version_capacity" numeric,
  	"version_registration_mode" "datuk_cms"."enum__seminars_v_version_registration_mode" DEFAULT 'form',
  	"version_external_url" varchar,
  	"version_slug" varchar,
  	"version_publish_at" timestamp(3) with time zone,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "datuk_cms"."enum__seminars_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "datuk_cms"."seminar_registrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seminar_id" integer,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"seats" numeric DEFAULT 1,
  	"notes" varchar,
  	"status" "datuk_cms"."enum_seminar_registrations_status" DEFAULT 'registered',
  	"consent" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"country" varchar,
  	"interest" varchar,
  	"message" varchar,
  	"status" "datuk_cms"."enum_enquiries_status" DEFAULT 'new',
  	"source" varchar DEFAULT 'website',
  	"consent" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"excerpt" varchar,
  	"cover_id" integer,
  	"body" jsonb,
  	"slug" varchar,
  	"category_id" integer,
  	"author_name" varchar DEFAULT 'Datuk Dr Inder',
  	"reviewed_by" varchar DEFAULT 'Datuk Dr Inderjit Kaur (DPSM), MBBS, ABHRS Diplomate',
  	"reading_minutes" numeric,
  	"publish_at" timestamp(3) with time zone,
  	"published_at" timestamp(3) with time zone,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "datuk_cms"."enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "datuk_cms"."_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_cover_id" integer,
  	"version_body" jsonb,
  	"version_slug" varchar,
  	"version_category_id" integer,
  	"version_author_name" varchar DEFAULT 'Datuk Dr Inder',
  	"version_reviewed_by" varchar DEFAULT 'Datuk Dr Inderjit Kaur (DPSM), MBBS, ABHRS Diplomate',
  	"version_reading_minutes" numeric,
  	"version_publish_at" timestamp(3) with time zone,
  	"version_published_at" timestamp(3) with time zone,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "datuk_cms"."enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "datuk_cms"."categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."awards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"presented_by" varchar NOT NULL,
  	"certificate_image_id" integer,
  	"show_on_ring" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."certificates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"issuer" varchar,
  	"year" varchar,
  	"image_id" integer,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."recognition_logos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"caption" varchar NOT NULL,
  	"logo_id" integer,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."press_features" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"publication" varchar NOT NULL,
  	"headline" varchar,
  	"date" timestamp(3) with time zone,
  	"image_id" integer,
  	"link" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."press_features_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "datuk_cms"."publications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"authors" varchar DEFAULT 'Inderjit Kaur',
  	"journal" varchar,
  	"citation" varchar,
  	"abstract" varchar,
  	"pdf_id" integer,
  	"cover_id" integer,
  	"link" varchar,
  	"published_on" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."instagram_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ig_id" varchar NOT NULL,
  	"caption" varchar,
  	"media_type" varchar,
  	"media_url" varchar,
  	"thumbnail_url" varchar,
  	"permalink" varchar,
  	"posted_at" timestamp(3) with time zone,
  	"pinned" boolean DEFAULT false,
  	"hidden" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar
  );
  
  CREATE TABLE "datuk_cms"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "datuk_cms"."enum_users_role" DEFAULT 'admin' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "datuk_cms"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer,
  	"seminars_id" integer,
  	"seminar_registrations_id" integer,
  	"enquiries_id" integer,
  	"articles_id" integer,
  	"categories_id" integer,
  	"awards_id" integer,
  	"certificates_id" integer,
  	"recognition_logos_id" integer,
  	"press_features_id" integer,
  	"publications_id" integer,
  	"instagram_posts_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "datuk_cms"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "datuk_cms"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datuk_cms"."site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar DEFAULT 'Founder & CEO',
  	"hero_intro" varchar DEFAULT 'A board-certified hair restoration physician who has spent more than three decades designing hairlines that look like they were always there.',
  	"hero_photo_id" integer,
  	"stat_years" varchar DEFAULT '30+',
  	"stat_years_label" varchar DEFAULT 'Years in hair restoration',
  	"stat_awards_label" varchar DEFAULT 'Awards since 2020',
  	"chip1_title" varchar DEFAULT 'ABHRS Diplomate',
  	"chip1_text" varchar DEFAULT 'American Board of Hair Restoration Surgery',
  	"hero_specialties_label" varchar DEFAULT 'Expert on',
  	"hero_specialties" varchar DEFAULT 'iGraft Long-Hair FUE
  Hairline Design
  Donor Assessment & Long-Term Planning
  Corrective Hair Transplantation',
  	"intro_video_url" varchar,
  	"story_video_id" integer,
  	"story_video_url" varchar,
  	"lcp_certificate_id" integer,
  	"lcp_label" varchar DEFAULT 'Letter of Credentialing & Privileging, Ministry of Health Malaysia',
  	"whatsapp_number" varchar DEFAULT '60125174606',
  	"phone_display" varchar DEFAULT '+60 12-517 4606',
  	"address_line1" varchar DEFAULT '102 Jalan Gasing',
  	"address_line2" varchar DEFAULT '46000 Petaling Jaya, Selangor',
  	"map_url" varchar DEFAULT 'https://g.page/hairtransplantcentremalaysia?share',
  	"notify_email" varchar,
  	"seo_title" varchar DEFAULT 'Datuk Dr Inder | Hair Restoration Physician, Malaysia',
  	"seo_description" varchar,
  	"og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "datuk_cms"."home_content" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"story_title" varchar DEFAULT 'A pioneer who shaped hair restoration in *Malaysia*',
  	"story_body" jsonb,
  	"philosophy_quote" varchar DEFAULT 'Hair restoration should never look artificial, and results should age naturally with the patient.',
  	"credentials_title" varchar DEFAULT 'Internationally certified. Globally *trusted*.',
  	"credentials_body" jsonb,
  	"expertise_title" varchar DEFAULT 'Precision. Artistry. *Natural* results.',
  	"expertise_body" jsonb,
  	"leadership_title" varchar DEFAULT 'Leading the industry, not *following* it',
  	"leadership_body" jsonb,
  	"awards_title" varchar DEFAULT 'Recognised excellence across Asia-Pacific',
  	"awards_body" jsonb,
  	"clinic_title" varchar DEFAULT 'Klinik Dr Inder, where expertise meets *care*',
  	"clinic_body" jsonb,
  	"press_title" varchar DEFAULT 'As featured in *the press*',
  	"instagram_title" varchar DEFAULT 'Follow her *work*',
  	"instagram_handle" varchar DEFAULT 'datukdrinder',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "datuk_cms"."home_content_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "datuk_cms"."instagram_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"access_token" varchar,
  	"posts_to_show" numeric DEFAULT 8,
  	"account_username" varchar,
  	"token_expires_at" timestamp(3) with time zone,
  	"last_synced_at" timestamp(3) with time zone,
  	"last_status" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "datuk_cms"."events" ADD CONSTRAINT "events_seminar_id_seminars_id_fk" FOREIGN KEY ("seminar_id") REFERENCES "datuk_cms"."seminars"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "datuk_cms"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."events_rels" ADD CONSTRAINT "events_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "datuk_cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "datuk_cms"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."_events_v" ADD CONSTRAINT "_events_v_version_seminar_id_seminars_id_fk" FOREIGN KEY ("version_seminar_id") REFERENCES "datuk_cms"."seminars"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "datuk_cms"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."_events_v_rels" ADD CONSTRAINT "_events_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "datuk_cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."seminars" ADD CONSTRAINT "seminars_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."_seminars_v" ADD CONSTRAINT "_seminars_v_parent_id_seminars_id_fk" FOREIGN KEY ("parent_id") REFERENCES "datuk_cms"."seminars"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."_seminars_v" ADD CONSTRAINT "_seminars_v_version_poster_id_media_id_fk" FOREIGN KEY ("version_poster_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."seminar_registrations" ADD CONSTRAINT "seminar_registrations_seminar_id_seminars_id_fk" FOREIGN KEY ("seminar_id") REFERENCES "datuk_cms"."seminars"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."articles" ADD CONSTRAINT "articles_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "datuk_cms"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "datuk_cms"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."_articles_v" ADD CONSTRAINT "_articles_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."_articles_v" ADD CONSTRAINT "_articles_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "datuk_cms"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."awards" ADD CONSTRAINT "awards_certificate_image_id_media_id_fk" FOREIGN KEY ("certificate_image_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."certificates" ADD CONSTRAINT "certificates_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."recognition_logos" ADD CONSTRAINT "recognition_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."press_features" ADD CONSTRAINT "press_features_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."press_features_rels" ADD CONSTRAINT "press_features_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "datuk_cms"."press_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."press_features_rels" ADD CONSTRAINT "press_features_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "datuk_cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."publications" ADD CONSTRAINT "publications_pdf_id_media_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."publications" ADD CONSTRAINT "publications_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "datuk_cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "datuk_cms"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "datuk_cms"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_seminars_fk" FOREIGN KEY ("seminars_id") REFERENCES "datuk_cms"."seminars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_seminar_registrations_fk" FOREIGN KEY ("seminar_registrations_id") REFERENCES "datuk_cms"."seminar_registrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "datuk_cms"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "datuk_cms"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "datuk_cms"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_awards_fk" FOREIGN KEY ("awards_id") REFERENCES "datuk_cms"."awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_certificates_fk" FOREIGN KEY ("certificates_id") REFERENCES "datuk_cms"."certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recognition_logos_fk" FOREIGN KEY ("recognition_logos_id") REFERENCES "datuk_cms"."recognition_logos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_press_features_fk" FOREIGN KEY ("press_features_id") REFERENCES "datuk_cms"."press_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publications_fk" FOREIGN KEY ("publications_id") REFERENCES "datuk_cms"."publications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instagram_posts_fk" FOREIGN KEY ("instagram_posts_id") REFERENCES "datuk_cms"."instagram_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "datuk_cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "datuk_cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "datuk_cms"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "datuk_cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."site_settings" ADD CONSTRAINT "site_settings_hero_photo_id_media_id_fk" FOREIGN KEY ("hero_photo_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."site_settings" ADD CONSTRAINT "site_settings_story_video_id_media_id_fk" FOREIGN KEY ("story_video_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."site_settings" ADD CONSTRAINT "site_settings_lcp_certificate_id_media_id_fk" FOREIGN KEY ("lcp_certificate_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."site_settings" ADD CONSTRAINT "site_settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."home_content_rels" ADD CONSTRAINT "home_content_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "datuk_cms"."home_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datuk_cms"."home_content_rels" ADD CONSTRAINT "home_content_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "datuk_cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_seminar_idx" ON "datuk_cms"."events" USING btree ("seminar_id");
  CREATE INDEX "events_updated_at_idx" ON "datuk_cms"."events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "datuk_cms"."events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "datuk_cms"."events" USING btree ("_status");
  CREATE INDEX "events_rels_order_idx" ON "datuk_cms"."events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "datuk_cms"."events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "datuk_cms"."events_rels" USING btree ("path");
  CREATE INDEX "events_rels_media_id_idx" ON "datuk_cms"."events_rels" USING btree ("media_id");
  CREATE INDEX "_events_v_parent_idx" ON "datuk_cms"."_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_seminar_idx" ON "datuk_cms"."_events_v" USING btree ("version_seminar_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "datuk_cms"."_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "datuk_cms"."_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "datuk_cms"."_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "datuk_cms"."_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "datuk_cms"."_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "datuk_cms"."_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_rels_order_idx" ON "datuk_cms"."_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "datuk_cms"."_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "datuk_cms"."_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_media_id_idx" ON "datuk_cms"."_events_v_rels" USING btree ("media_id");
  CREATE INDEX "seminars_poster_idx" ON "datuk_cms"."seminars" USING btree ("poster_id");
  CREATE UNIQUE INDEX "seminars_slug_idx" ON "datuk_cms"."seminars" USING btree ("slug");
  CREATE INDEX "seminars_updated_at_idx" ON "datuk_cms"."seminars" USING btree ("updated_at");
  CREATE INDEX "seminars_created_at_idx" ON "datuk_cms"."seminars" USING btree ("created_at");
  CREATE INDEX "seminars__status_idx" ON "datuk_cms"."seminars" USING btree ("_status");
  CREATE INDEX "_seminars_v_parent_idx" ON "datuk_cms"."_seminars_v" USING btree ("parent_id");
  CREATE INDEX "_seminars_v_version_version_poster_idx" ON "datuk_cms"."_seminars_v" USING btree ("version_poster_id");
  CREATE INDEX "_seminars_v_version_version_slug_idx" ON "datuk_cms"."_seminars_v" USING btree ("version_slug");
  CREATE INDEX "_seminars_v_version_version_updated_at_idx" ON "datuk_cms"."_seminars_v" USING btree ("version_updated_at");
  CREATE INDEX "_seminars_v_version_version_created_at_idx" ON "datuk_cms"."_seminars_v" USING btree ("version_created_at");
  CREATE INDEX "_seminars_v_version_version__status_idx" ON "datuk_cms"."_seminars_v" USING btree ("version__status");
  CREATE INDEX "_seminars_v_created_at_idx" ON "datuk_cms"."_seminars_v" USING btree ("created_at");
  CREATE INDEX "_seminars_v_updated_at_idx" ON "datuk_cms"."_seminars_v" USING btree ("updated_at");
  CREATE INDEX "_seminars_v_latest_idx" ON "datuk_cms"."_seminars_v" USING btree ("latest");
  CREATE INDEX "seminar_registrations_seminar_idx" ON "datuk_cms"."seminar_registrations" USING btree ("seminar_id");
  CREATE INDEX "seminar_registrations_updated_at_idx" ON "datuk_cms"."seminar_registrations" USING btree ("updated_at");
  CREATE INDEX "seminar_registrations_created_at_idx" ON "datuk_cms"."seminar_registrations" USING btree ("created_at");
  CREATE INDEX "enquiries_updated_at_idx" ON "datuk_cms"."enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "datuk_cms"."enquiries" USING btree ("created_at");
  CREATE INDEX "articles_cover_idx" ON "datuk_cms"."articles" USING btree ("cover_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "datuk_cms"."articles" USING btree ("slug");
  CREATE INDEX "articles_category_idx" ON "datuk_cms"."articles" USING btree ("category_id");
  CREATE INDEX "articles_updated_at_idx" ON "datuk_cms"."articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "datuk_cms"."articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "datuk_cms"."articles" USING btree ("_status");
  CREATE INDEX "_articles_v_parent_idx" ON "datuk_cms"."_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_cover_idx" ON "datuk_cms"."_articles_v" USING btree ("version_cover_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "datuk_cms"."_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_category_idx" ON "datuk_cms"."_articles_v" USING btree ("version_category_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "datuk_cms"."_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "datuk_cms"."_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "datuk_cms"."_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "datuk_cms"."_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "datuk_cms"."_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "datuk_cms"."_articles_v" USING btree ("latest");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "datuk_cms"."categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "datuk_cms"."categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "datuk_cms"."categories" USING btree ("created_at");
  CREATE INDEX "awards_certificate_image_idx" ON "datuk_cms"."awards" USING btree ("certificate_image_id");
  CREATE INDEX "awards_updated_at_idx" ON "datuk_cms"."awards" USING btree ("updated_at");
  CREATE INDEX "awards_created_at_idx" ON "datuk_cms"."awards" USING btree ("created_at");
  CREATE INDEX "certificates_image_idx" ON "datuk_cms"."certificates" USING btree ("image_id");
  CREATE INDEX "certificates_updated_at_idx" ON "datuk_cms"."certificates" USING btree ("updated_at");
  CREATE INDEX "certificates_created_at_idx" ON "datuk_cms"."certificates" USING btree ("created_at");
  CREATE INDEX "recognition_logos_logo_idx" ON "datuk_cms"."recognition_logos" USING btree ("logo_id");
  CREATE INDEX "recognition_logos_updated_at_idx" ON "datuk_cms"."recognition_logos" USING btree ("updated_at");
  CREATE INDEX "recognition_logos_created_at_idx" ON "datuk_cms"."recognition_logos" USING btree ("created_at");
  CREATE INDEX "press_features_image_idx" ON "datuk_cms"."press_features" USING btree ("image_id");
  CREATE INDEX "press_features_updated_at_idx" ON "datuk_cms"."press_features" USING btree ("updated_at");
  CREATE INDEX "press_features_created_at_idx" ON "datuk_cms"."press_features" USING btree ("created_at");
  CREATE INDEX "press_features_rels_order_idx" ON "datuk_cms"."press_features_rels" USING btree ("order");
  CREATE INDEX "press_features_rels_parent_idx" ON "datuk_cms"."press_features_rels" USING btree ("parent_id");
  CREATE INDEX "press_features_rels_path_idx" ON "datuk_cms"."press_features_rels" USING btree ("path");
  CREATE INDEX "press_features_rels_media_id_idx" ON "datuk_cms"."press_features_rels" USING btree ("media_id");
  CREATE INDEX "publications_pdf_idx" ON "datuk_cms"."publications" USING btree ("pdf_id");
  CREATE INDEX "publications_cover_idx" ON "datuk_cms"."publications" USING btree ("cover_id");
  CREATE INDEX "publications_updated_at_idx" ON "datuk_cms"."publications" USING btree ("updated_at");
  CREATE INDEX "publications_created_at_idx" ON "datuk_cms"."publications" USING btree ("created_at");
  CREATE UNIQUE INDEX "instagram_posts_ig_id_idx" ON "datuk_cms"."instagram_posts" USING btree ("ig_id");
  CREATE INDEX "instagram_posts_updated_at_idx" ON "datuk_cms"."instagram_posts" USING btree ("updated_at");
  CREATE INDEX "instagram_posts_created_at_idx" ON "datuk_cms"."instagram_posts" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "datuk_cms"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "datuk_cms"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "datuk_cms"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "datuk_cms"."media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "datuk_cms"."media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "datuk_cms"."media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "datuk_cms"."media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "users_sessions_order_idx" ON "datuk_cms"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "datuk_cms"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "datuk_cms"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "datuk_cms"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "datuk_cms"."users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "datuk_cms"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "datuk_cms"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "datuk_cms"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "datuk_cms"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_seminars_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("seminars_id");
  CREATE INDEX "payload_locked_documents_rels_seminar_registrations_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("seminar_registrations_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_awards_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("awards_id");
  CREATE INDEX "payload_locked_documents_rels_certificates_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("certificates_id");
  CREATE INDEX "payload_locked_documents_rels_recognition_logos_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("recognition_logos_id");
  CREATE INDEX "payload_locked_documents_rels_press_features_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("press_features_id");
  CREATE INDEX "payload_locked_documents_rels_publications_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("publications_id");
  CREATE INDEX "payload_locked_documents_rels_instagram_posts_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("instagram_posts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "datuk_cms"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "datuk_cms"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "datuk_cms"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "datuk_cms"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "datuk_cms"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "datuk_cms"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "datuk_cms"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "datuk_cms"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "datuk_cms"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "datuk_cms"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_hero_photo_idx" ON "datuk_cms"."site_settings" USING btree ("hero_photo_id");
  CREATE INDEX "site_settings_story_video_idx" ON "datuk_cms"."site_settings" USING btree ("story_video_id");
  CREATE INDEX "site_settings_lcp_certificate_idx" ON "datuk_cms"."site_settings" USING btree ("lcp_certificate_id");
  CREATE INDEX "site_settings_og_image_idx" ON "datuk_cms"."site_settings" USING btree ("og_image_id");
  CREATE INDEX "home_content_rels_order_idx" ON "datuk_cms"."home_content_rels" USING btree ("order");
  CREATE INDEX "home_content_rels_parent_idx" ON "datuk_cms"."home_content_rels" USING btree ("parent_id");
  CREATE INDEX "home_content_rels_path_idx" ON "datuk_cms"."home_content_rels" USING btree ("path");
  CREATE INDEX "home_content_rels_media_id_idx" ON "datuk_cms"."home_content_rels" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "datuk_cms"."events" CASCADE;
  DROP TABLE "datuk_cms"."events_rels" CASCADE;
  DROP TABLE "datuk_cms"."_events_v" CASCADE;
  DROP TABLE "datuk_cms"."_events_v_rels" CASCADE;
  DROP TABLE "datuk_cms"."seminars" CASCADE;
  DROP TABLE "datuk_cms"."_seminars_v" CASCADE;
  DROP TABLE "datuk_cms"."seminar_registrations" CASCADE;
  DROP TABLE "datuk_cms"."enquiries" CASCADE;
  DROP TABLE "datuk_cms"."articles" CASCADE;
  DROP TABLE "datuk_cms"."_articles_v" CASCADE;
  DROP TABLE "datuk_cms"."categories" CASCADE;
  DROP TABLE "datuk_cms"."awards" CASCADE;
  DROP TABLE "datuk_cms"."certificates" CASCADE;
  DROP TABLE "datuk_cms"."recognition_logos" CASCADE;
  DROP TABLE "datuk_cms"."press_features" CASCADE;
  DROP TABLE "datuk_cms"."press_features_rels" CASCADE;
  DROP TABLE "datuk_cms"."publications" CASCADE;
  DROP TABLE "datuk_cms"."instagram_posts" CASCADE;
  DROP TABLE "datuk_cms"."media" CASCADE;
  DROP TABLE "datuk_cms"."users_sessions" CASCADE;
  DROP TABLE "datuk_cms"."users" CASCADE;
  DROP TABLE "datuk_cms"."payload_kv" CASCADE;
  DROP TABLE "datuk_cms"."payload_locked_documents" CASCADE;
  DROP TABLE "datuk_cms"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "datuk_cms"."payload_preferences" CASCADE;
  DROP TABLE "datuk_cms"."payload_preferences_rels" CASCADE;
  DROP TABLE "datuk_cms"."payload_migrations" CASCADE;
  DROP TABLE "datuk_cms"."site_settings" CASCADE;
  DROP TABLE "datuk_cms"."home_content" CASCADE;
  DROP TABLE "datuk_cms"."home_content_rels" CASCADE;
  DROP TABLE "datuk_cms"."instagram_settings" CASCADE;
  DROP TYPE "datuk_cms"."enum_events_role";
  DROP TYPE "datuk_cms"."enum_events_status";
  DROP TYPE "datuk_cms"."enum__events_v_version_role";
  DROP TYPE "datuk_cms"."enum__events_v_version_status";
  DROP TYPE "datuk_cms"."enum_seminars_registration_mode";
  DROP TYPE "datuk_cms"."enum_seminars_status";
  DROP TYPE "datuk_cms"."enum__seminars_v_version_registration_mode";
  DROP TYPE "datuk_cms"."enum__seminars_v_version_status";
  DROP TYPE "datuk_cms"."enum_seminar_registrations_status";
  DROP TYPE "datuk_cms"."enum_enquiries_status";
  DROP TYPE "datuk_cms"."enum_articles_status";
  DROP TYPE "datuk_cms"."enum__articles_v_version_status";
  DROP TYPE "datuk_cms"."enum_users_role";`)
}
