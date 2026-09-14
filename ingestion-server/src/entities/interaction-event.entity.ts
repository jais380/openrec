import { InteractionEventType } from "../utils/enums";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('interaction_events')
@Index(['projectId', 'userId'])
@Index(['createdAt'])
@Index(['modifiedAt'])
export class InteractionEvent {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'project_id', type: 'uuid', nullable: false })
    projectId!: string;

    @Column({ name: 'user_id', type: 'varchar', nullable: false })
    userId!: string;

    @Column({ name: 'item_id', type: 'varchar', nullable: false })
    itemId!: string;

    @Column({
        type: 'enum',
        enum: InteractionEventType,
        nullable: false
    })
    eventType!: InteractionEventType;

    @Column({ name: 'interaction_value', type: 'float', default: 1.0 })
    interactionValue!: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'modified_at', type: 'timestamptz' })
    modifiedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
    deletedAt!: Date;
}
