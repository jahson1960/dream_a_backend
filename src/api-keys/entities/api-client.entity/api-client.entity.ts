import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('api_clients')
export class ApiClient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  api_key!: string;

  @Column()
  status!: string;
}