import { Exclude } from 'class-transformer';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class AbstractManagableEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Exclude()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Exclude()
  @Column({ name: 'created_by', default: 'SYSTEM' })
  createdBy: string;

  @Exclude()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Exclude()
  @Column({ name: 'updated_by', default: 'SYSTEM' })
  updatedBy: string;

  @Exclude()
  @DeleteDateColumn({ name: 'deleted_at', nullable: true, select: false })
  deletedAt: Date | null;

  @Exclude()
  @Column({
    name: 'deleted_by',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  deletedBy: string | null;
}
