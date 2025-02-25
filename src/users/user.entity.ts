import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
  } from 'typeorm';
  
  @Entity()
  export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    first_name: string;
  
    @Column()
    last_name: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    modified_at: Date;
  
    @DeleteDateColumn()
    deleted_at: Date | null;
  }
  