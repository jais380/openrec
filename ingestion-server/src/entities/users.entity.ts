import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
@Index(['username'], { unique: true })
@Index(['email'], { unique: true })
@Index(['apiKey'], { unique: true })
@Index(['apiSecretHash'], { unique: true })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ nullable: false, type: 'varchar' })
    username!: string;

    @Column({ nullable: false, type: 'varchar' })
    email!: string;

    @Column({ name: 'password_hash', nullable: false, type: 'varchar' })
    passwordHash!: string;

    @Column({ name: 'api_key', nullable: false, type: 'varchar' })
    apiKey!: string;

    @Column({ name: 'api_secret_hash', nullable: false, type: 'varchar' })
    apiSecretHash!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;
}
