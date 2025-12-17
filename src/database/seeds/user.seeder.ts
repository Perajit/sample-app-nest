import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { Seeder } from 'typeorm-extension';
import { User } from 'src/modules/users/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(User);

    const email = process.env.SEED_ADMIN_EMAIL || '';
    const existingUser = await repository.findOne({
      where: { email },
    });

    if (existingUser) {
      console.log(`Admin user with email ${email} already exists`);
      return;
    }

    const password = process.env.SEED_ADMIN_PASSWORD || '';
    const hashedPassword = await hash(password, 10);

    const dataToSave: Partial<User> = {
      email: email,
      hashedPassword: hashedPassword,
      firstName: process.env.SEED_ADMIN_FIRST_NAME || '',
      lastName: process.env.SEED_ADMIN_LAST_NAME || '',
      roles: [UserRole.ADMIN],
      createdBy: 'system',
      updatedBy: 'system',
    };

    await repository.insert([dataToSave]);

    console.log('Completed inserting data');
  }
}
