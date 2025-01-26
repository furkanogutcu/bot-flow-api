import readline from 'node:readline/promises';

import { ILike } from 'typeorm';
import { ZodError } from 'zod';

import { UserRole } from '../../common/references/user-role.reference';
import { UserStatus } from '../../common/references/user-status.reference';
import { User } from '../../modules/users/entities/user.entity';
import { emailSchema, passwordSchema } from '../../validations/auth.validation';
import dataSource from '../typeorm.data-source';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  try {
    const email = await rl.question('Enter email: ');
    const validatedEmail = emailSchema.parse(email);

    await dataSource.initialize();

    const existUser = await dataSource.manager.findOne(User, {
      where: {
        email: ILike(validatedEmail),
      },
    });

    if (existUser) throw new Error('Email already exist.');

    const password = await rl.question('Enter password: ');
    const validatedPassword = passwordSchema.parse(password);

    const user = dataSource.manager.create(User, {
      email: validatedEmail,
      passwordHash: validatedPassword,
      role: UserRole.SuperAdmin,
      status: UserStatus.Active,
    });

    await dataSource.manager.save(User, user);

    console.log('\n', 'Admin registration successfully. You can login using the login details below:');

    console.log('-> Email: ', email);
    console.log('-> Password: ', password);

    rl.close();
  } catch (error: any) {
    if (error instanceof ZodError) {
      console.error('-> ', error.errors[0].message);
    } else {
      console.error('->', error.message);
    }

    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

void main();
