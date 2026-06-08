import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';
import { Photo } from './photo.entity';

export type SessionStatus = 'active' | 'expired' | 'deleted';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index({ unique: true })
  @Column({ unique: true })
  slug: string;

  @Column({ default: 'active' })
  status: SessionStatus;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Photo, (p) => p.session, { cascade: true })
  photos: Photo[];
}
