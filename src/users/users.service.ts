import { JwtService } from './../jwt/jwt.service';
import { LoginInput } from './dtos/login.dto';
import { CreateAccountInput } from './dtos/create-account.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly config: ConfigService,
    private readonly JwtService: JwtService,
  ) {
    this.JwtService.hello();
  }

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<[boolean, string?]> {
    // check user
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return [false, 'There is a user with that email already'];
      }
      await this.users.save(this.users.create({ email, password, role }));
      return [true];
    } catch (e) {
      return [false, "Couldn't create account"];
    }
    // pw hashing
  }

  async login({
    email,
    password, //  ok    error   jwt
  }: LoginInput): Promise<[boolean, string?, string?]> {
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return [false, 'User not found', null];
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return [false, 'Wrong password', null];
      }
      const token = jwt.sign({ id: user.id }, this.config.get('TOKEN_KEY'));
      return [true, null, token];
    } catch (e) {
      return [false, e, null];
    }
  }
}
