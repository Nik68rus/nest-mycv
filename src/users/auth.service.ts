import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    //check if email in use
    const users = await this.userService.find(email);

    if (users.length) {
      throw new BadRequestException('Email in use!');
    }

    //Hash password
    //Generate salt
    const salt = randomBytes(8).toString('hex');

    //hash salt and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    //join hashed res and salt
    const result = salt + '.' + hash.toString('hex');

    //Create new user and save
    const user = await this.userService.create(email, result);

    //return user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email);
    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('Wrong password!');
    }

    return user;
  }
}
