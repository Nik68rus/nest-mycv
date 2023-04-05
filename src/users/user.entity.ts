import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  AfterInsert,
  AfterUpdate,
  AfterRemove,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @AfterInsert()
  logInsert() {
    console.log('Insertet user', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated user', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('Removed user', this.id);
  }
}
