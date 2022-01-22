import { Verification } from './entities/verification.entity';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { JwtService } from './../jwt/jwt.service';
import { LoginInput } from './dtos/login.dto';
import { CreateAccountInput } from './dtos/create-account.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { VerifyEmailOutput } from './dtos/verify-email.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly JwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error: string }> {
    // check user
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      // pw hashing by beforeInsert (listner in entity)
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      await this.verifications.save(this.verifications.create({ user }));
      return { ok: true, error: 'no error' };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error: string; token: string }> {
    let serviceOutput = { ok: false, error: 'before progress', token: null };
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );
      if (!user) {
        serviceOutput.error = 'User not found';
      } else {
        const passwordCorrect = await user.checkPassword(password);
        if (!passwordCorrect) {
          serviceOutput.error = 'Wrong PW';
        } else {
          const token = this.JwtService.sign({ id: user.id });
          // const token = jwt.sign({ id: user.id }, this.config.get('TOKEN_KEY'));
          serviceOutput = { ok: true, error: 'no error', token };
        }
      }
    } catch (error) {
      serviceOutput = { ok: false, error, token: null };
    }
    return serviceOutput;
  }

  async findById(id: number): Promise<User> {
    return this.users.findOne({ id });
  }

  async editProfile(
    id: number,
    { email, password }: EditProfileInput,
  ): Promise<User> {
    const user = await this.users.findOne(id);
    if (email) {
      user.email = email;
      user.verified = false;
      await this.verifications.save(this.verifications.create({ user }));
    }
    if (password) {
      user.password = password;
    }
    return this.users.save(user);
  }

  async deleteProfile(id, deleteProfileInput) {
    let ret = { ok: false, error: 'deleteProfile not done' };
    const user = await this.users.findOne(id);
    try {
      const passwordMatch = await bcrypt.compare(
        deleteProfileInput.password,
        user.password,
      );
      if (passwordMatch) {
        this.users.delete(id);
        ret = { ok: true, error: null };
      } else {
        ret = { ok: false, error: 'PW not match' };
      }
    } catch (error) {
      ret.error = error;
    }
    return ret;
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    const verification = await this.verifications.findOne(
      { code },
      { relations: ['user'] },
    );
    if (verification) {
      verification.user.verified = true;
      this.users.save(verification.user);
    }
    return { ok: true, error: null };
  }
}
