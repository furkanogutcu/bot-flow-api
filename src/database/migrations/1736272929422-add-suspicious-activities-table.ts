import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuspiciousActivitiesTable1736272929422 implements MigrationInterface {
  name = 'AddSuspiciousActivitiesTable1736272929422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."suspicious_activities_type_enum" AS ENUM('UNRECOGNIZED_LOGIN')`);
    await queryRunner.query(
      `CREATE TABLE "suspicious_activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."suspicious_activities_type_enum" NOT NULL, "details" json, "resolve_token" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "resolved_at" TIMESTAMP, "user_id" uuid NOT NULL, "session_id" uuid, CONSTRAINT "UQ_b258d5f9dfb8ff9b6d42723daea" UNIQUE ("resolve_token"), CONSTRAINT "PK_c03f5576ed92d11f99d98ebf281" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "suspicious_activities" ADD CONSTRAINT "FK_5a44886f49e852d74d77e7145ef" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "suspicious_activities" ADD CONSTRAINT "FK_dc76d178cf8ab66c562a6c617b2" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "suspicious_activities" DROP CONSTRAINT "FK_dc76d178cf8ab66c562a6c617b2"`);
    await queryRunner.query(`ALTER TABLE "suspicious_activities" DROP CONSTRAINT "FK_5a44886f49e852d74d77e7145ef"`);
    await queryRunner.query(`DROP TABLE "suspicious_activities"`);
    await queryRunner.query(`DROP TYPE "public"."suspicious_activities_type_enum"`);
  }
}
