import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** Events get an optional "details" rich-text field for their own page; new events default to Attendee. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "datuk_cms"."events" ADD COLUMN IF NOT EXISTS "details" jsonb;
  ALTER TABLE "datuk_cms"."_events_v" ADD COLUMN IF NOT EXISTS "version_details" jsonb;
  ALTER TABLE "datuk_cms"."events" ALTER COLUMN "role" SET DEFAULT 'Attendee';
  ALTER TABLE "datuk_cms"."_events_v" ALTER COLUMN "version_role" SET DEFAULT 'Attendee';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "datuk_cms"."events" DROP COLUMN IF EXISTS "details";
  ALTER TABLE "datuk_cms"."_events_v" DROP COLUMN IF EXISTS "version_details";
  ALTER TABLE "datuk_cms"."events" ALTER COLUMN "role" SET DEFAULT 'Speaker';
  ALTER TABLE "datuk_cms"."_events_v" ALTER COLUMN "version_role" SET DEFAULT 'Speaker';`)
}
