import type { MigrationInterface, QueryRunner } from "typeorm";

export class Init1788016720419 implements MigrationInterface {
    name = 'Init1788016720419'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."interaction_events_eventtype_enum" AS ENUM('VIEW', 'CLICK', 'LIKE', 'ADD_TO_CART', 'PURCHASE', 'RATING', 'DISLIKE')`);
        await queryRunner.query(`CREATE TABLE "interaction_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "user_id" character varying NOT NULL, "item_id" character varying NOT NULL, "eventType" "public"."interaction_events_eventtype_enum" NOT NULL, "interaction_value" double precision NOT NULL DEFAULT '1', "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f368078a4729d4a34b224aeff82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bd23a28bb6ec6b237a68b5d5b1" ON "interaction_events"  ("timestamp") `);
        await queryRunner.query(`CREATE INDEX "IDX_5785145aeb5fbf0401bbe01bd4" ON "interaction_events"  ("project_id", "user_id") `);
        await queryRunner.query(`CREATE TABLE "recommendation_predictions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "user_id" character varying NOT NULL, "recommended_item_ids" jsonb NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f2c97f02d5b36d5441f2cb457db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_011267cb4e9ff7f0bab136e952" ON "recommendation_predictions"  ("updated_at") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0f4a041cc09e0bec07c20ffccd" ON "recommendation_predictions"  ("project_id", "user_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_0f4a041cc09e0bec07c20ffccd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_011267cb4e9ff7f0bab136e952"`);
        await queryRunner.query(`DROP TABLE "recommendation_predictions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5785145aeb5fbf0401bbe01bd4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bd23a28bb6ec6b237a68b5d5b1"`);
        await queryRunner.query(`DROP TABLE "interaction_events"`);
        await queryRunner.query(`DROP TYPE "public"."interaction_events_eventtype_enum"`);
    }

}
