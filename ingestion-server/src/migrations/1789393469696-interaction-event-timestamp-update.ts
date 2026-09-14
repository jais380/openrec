import type { MigrationInterface, QueryRunner } from "typeorm";

export class InteractionEventTimestampUpdate1789393469696 implements MigrationInterface {
    name = 'InteractionEventTimestampUpdate1789393469696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_bd23a28bb6ec6b237a68b5d5b1"`);
        await queryRunner.query(`ALTER TABLE "interaction_events" DROP COLUMN "timestamp"`);
        await queryRunner.query(`ALTER TABLE "interaction_events" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "interaction_events" ADD "modified_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "interaction_events" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE INDEX "IDX_bf70166cb7e80052239e4e80f1" ON "interaction_events"  ("modified_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_1b453ee0707220a23ebf9df96a" ON "interaction_events"  ("created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_1b453ee0707220a23ebf9df96a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bf70166cb7e80052239e4e80f1"`);
        await queryRunner.query(`ALTER TABLE "interaction_events" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "interaction_events" DROP COLUMN "modified_at"`);
        await queryRunner.query(`ALTER TABLE "interaction_events" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "interaction_events" ADD "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "IDX_bd23a28bb6ec6b237a68b5d5b1" ON "interaction_events" USING btree ("timestamp") `);
    }

}
