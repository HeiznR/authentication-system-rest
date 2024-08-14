import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: string;
  @Column()
  userName: string;
  @Column()
  name: string;
  @Column()
  surname: string;
  @Column({ unique: true })
  email: string;
  @Column()
  password: string;
}
