import { InteractionEventType } from "src/utils/enums";
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('interaction_events')
@Index(['projectId', 'userId'])
@Index(['timestamp'])
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

    @CreateDateColumn({ type: 'timestamptz' })
    timestamp!: Date;
}
