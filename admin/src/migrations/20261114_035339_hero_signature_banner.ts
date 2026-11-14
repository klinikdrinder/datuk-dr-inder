import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "datuk_cms"."site_settings" ADD COLUMN "signature_label" varchar DEFAULT 'Signature approach';
  ALTER TABLE "datuk_cms"."site_settings" ADD COLUMN "signature_text" varchar DEFAULT 'Patient comfort & personalised pain management';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "datuk_cms"."site_settings" DROP COLUMN "signature_label";
  ALTER TABLE "datuk_cms"."site_settings" DROP COLUMN "signature_text";`)
}
