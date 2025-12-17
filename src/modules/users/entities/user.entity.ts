import { Exclude } from 'class-transformer';
import { AbstractManagableEntity } from 'src/common/entities/abstract-managable.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class User extends AbstractManagableEntity {
  @Column({ name: 'email' })
  email: string;

  @Exclude()
  @Column({ name: 'hashed_password' })
  hashedPassword: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    name: 'roles',
    type: 'simple-array',
  })
  roles: UserRole[];
}
