import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export interface RecommendedType {
    itemId: string,
    score: number
}

@Entity('recommendation_predictions')
@Index(['projectId', 'userId'], { unique: true })
@Index(['updatedAt'])
export class RecommendationPrediction {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'project_id', type: 'uuid', nullable: false })
    projectId!: string;

    @Column({ name: 'user_id', type: 'varchar', nullable: false })
    userId!: string;

    @Column({ name: 'recommended_item_ids', type: 'jsonb', nullable: false })
    recommendedItemIds!: RecommendedType[] | string[];

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;
}
