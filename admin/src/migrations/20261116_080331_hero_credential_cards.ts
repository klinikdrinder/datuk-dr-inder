import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "datuk_cms"."site_settings" ALTER COLUMN "seo_title" SET DEFAULT 'Datuk Dr Inder | Hair Transplant & Long-Hair FUE, Petaling Jaya';
  ALTER TABLE "datuk_cms"."site_settings" ADD COLUMN "chip2_title" varchar DEFAULT 'Fellow ISHRS';
  ALTER TABLE "datuk_cms"."site_settings" ADD COLUMN "chip2_text" varchar DEFAULT 'International Society of Hair Restoration Surgery';
  ALTER TABLE "datuk_cms"."site_settings" ADD COLUMN "chip3_title" varchar DEFAULT 'LCP Certified';
  ALTER TABLE "datuk_cms"."site_settings" ADD COLUMN "chip3_text" varchar DEFAULT 'Ministry of Health Malaysia';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "datuk_cms"."site_settings" ALTER COLUMN "seo_title" SET DEFAULT 'Datuk Dr Inder | Hair Restoration Physician, Malaysia';
  ALTER TABLE "datuk_cms"."site_settings" DROP COLUMN "chip2_title";
  ALTER TABLE "datuk_cms"."site_settings" DROP COLUMN "chip2_text";
  ALTER TABLE "datuk_cms"."site_settings" DROP COLUMN "chip3_title";
  ALTER TABLE "datuk_cms"."site_settings" DROP COLUMN "chip3_text";`)
}
