import { MigrationInterface, QueryRunner } from 'typeorm';

export class MultiFactorAuthentication1736758755546 implements MigrationInterface {
  name = 'MultiFactorAuthentication1736758755546';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "mfa_enabled" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`CREATE TYPE "public"."users_mfa_method_enum" AS ENUM('email', 'totp')`);
    await queryRunner.query(`ALTER TABLE "users" ADD "mfa_method" "public"."users_mfa_method_enum"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "mfa_secret" character varying`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD "mfa_verified_at" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "mfa_verified_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mfa_secret"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mfa_method"`);
    await queryRunner.query(`DROP TYPE "public"."users_mfa_method_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mfa_enabled"`);
  }
}
