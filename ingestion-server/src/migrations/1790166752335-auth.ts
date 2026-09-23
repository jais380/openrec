import type { MigrationInterface, QueryRunner } from "typeorm";

export class Auth1790166752335 implements MigrationInterface {
    name = 'Auth1790166752335'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "api_key" character varying NOT NULL, "api_secret_hash" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b5f0c1ab6e6ee13646ec642796" ON "users"  ("api_secret_hash") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_16bfa631de67a4fafe7ce3f2fe" ON "users"  ("api_key") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users"  ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users"  ("username") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_16bfa631de67a4fafe7ce3f2fe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b5f0c1ab6e6ee13646ec642796"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
