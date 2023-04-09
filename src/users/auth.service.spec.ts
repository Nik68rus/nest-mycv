import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of userService
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('test@test.com', 'test');

    expect(user.password).not.toEqual('test');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email in use', async () => {
    // fakeUsersService.find = () =>
    //   Promise.resolve([
    //     { id: 1, email: 'test@test.com', password: 'hashedtest' },
    //   ] as User[]);
    await service.signup('test@test.com', 'test');
    await expect(service.signup('test@test.com', 'test')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signing in with unused email', async () => {
    await expect(service.signin('test@test.com', 'jjj')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws if invalid password provided', async () => {
    // fakeUsersService.find = () =>
    //   Promise.resolve([{ email: 'test@test.com', password: 'test' }] as User[]);
    await service.signup('test@test.com', 'www');
    await expect(service.signin('test@test.com', 'qqq')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns a user if correct password provided', async () => {
    await service.signup('test@test.com', 'qqq');
    const user = await service.signin('test@test.com', 'qqq');

    expect(user).toBeDefined();
  });
});
