import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  api_client_id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  email_enc!: string;

  @Column({ unique: true })
  email_hash!: string;

  @Column()
  first_name_enc!: string;

  @Column({ nullable: true })
  middle_name_enc!: string;

  @Column()
  last_name_enc!: string;

  @Column({ unique: true })
  account_number!: string;

  @CreateDateColumn()
  created_at!: Date;
}