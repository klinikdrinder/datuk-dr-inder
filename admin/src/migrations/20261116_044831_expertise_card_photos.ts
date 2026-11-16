import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "datuk_cms"."home_content" ADD COLUMN "expertise_hairline_photo_id" integer;
  ALTER TABLE "datuk_cms"."home_content" ADD COLUMN "expertise_fue_photo_id" integer;
  ALTER TABLE "datuk_cms"."home_content" ADD COLUMN "expertise_brow_photo_id" integer;
  ALTER TABLE "datuk_cms"."home_content" ADD COLUMN "expertise_beard_photo_id" integer;
  ALTER TABLE "datuk_cms"."home_content" ADD CONSTRAINT "home_content_expertise_hairline_photo_id_media_id_fk" FOREIGN KEY ("expertise_hairline_photo_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."home_content" ADD CONSTRAINT "home_content_expertise_fue_photo_id_media_id_fk" FOREIGN KEY ("expertise_fue_photo_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."home_content" ADD CONSTRAINT "home_content_expertise_brow_photo_id_media_id_fk" FOREIGN KEY ("expertise_brow_photo_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datuk_cms"."home_content" ADD CONSTRAINT "home_content_expertise_beard_photo_id_media_id_fk" FOREIGN KEY ("expertise_beard_photo_id") REFERENCES "datuk_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_content_expertise_hairline_photo_idx" ON "datuk_cms"."home_content" USING btree ("expertise_hairline_photo_id");
  CREATE INDEX "home_content_expertise_fue_photo_idx" ON "datuk_cms"."home_content" USING btree ("expertise_fue_photo_id");
  CREATE INDEX "home_content_expertise_brow_photo_idx" ON "datuk_cms"."home_content" USING btree ("expertise_brow_photo_id");
  CREATE INDEX "home_content_expertise_beard_photo_idx" ON "datuk_cms"."home_content" USING btree ("expertise_beard_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "datuk_cms"."home_content" DROP CONSTRAINT "home_content_expertise_hairline_photo_id_media_id_fk";
  
  ALTER TABLE "datuk_cms"."home_content" DROP CONSTRAINT "home_content_expertise_fue_photo_id_media_id_fk";
  
  ALTER TABLE "datuk_cms"."home_content" DROP CONSTRAINT "home_content_expertise_brow_photo_id_media_id_fk";
  
  ALTER TABLE "datuk_cms"."home_content" DROP CONSTRAINT "home_content_expertise_beard_photo_id_media_id_fk";
  
  DROP INDEX "datuk_cms"."home_content_expertise_hairline_photo_idx";
  DROP INDEX "datuk_cms"."home_content_expertise_fue_photo_idx";
  DROP INDEX "datuk_cms"."home_content_expertise_brow_photo_idx";
  DROP INDEX "datuk_cms"."home_content_expertise_beard_photo_idx";
  ALTER TABLE "datuk_cms"."home_content" DROP COLUMN "expertise_hairline_photo_id";
  ALTER TABLE "datuk_cms"."home_content" DROP COLUMN "expertise_fue_photo_id";
  ALTER TABLE "datuk_cms"."home_content" DROP COLUMN "expertise_brow_photo_id";
  ALTER TABLE "datuk_cms"."home_content" DROP COLUMN "expertise_beard_photo_id";`)
}
