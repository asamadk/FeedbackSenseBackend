import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './UserEntity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  header: string

  @Column()
  message: string;

  @Column()
  date: Date;

  @Column()
  is_read: boolean;

  @ManyToOne(type => User, user => user.notifications,{onDelete : 'CASCADE'})
  user: User;
}
