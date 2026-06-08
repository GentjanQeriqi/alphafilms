import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Session } from './session.entity';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  sessionId: string;

  @ManyToOne(() => Session, (s) => s.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: Session;

  @Column()
  filename: string;

  @Column()
  originalPath: string;

  @Column()
  webPath: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @CreateDateColumn()
  uploadedAt: Date;
}
