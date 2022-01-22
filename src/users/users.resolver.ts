import { AuthGuard } from './../auth/auth.guard';
import { LoginOutput, LoginInput } from './dtos/login.dto';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UseGuards } from '@nestjs/common';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileOutput, EditProfileInput } from './dtos/edit-profile.dto';
import { boolean } from 'joi';
import { DeleteProfileInput, DeleteProfileOutput } from './dtos/delete.dto';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}
  // default
  @Query((returns) => Boolean)
  hi() {
    console.log('hi');
    return true;
  }
  // create account
  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    let serviceOutput = { ok: false, error: 'before progress' };
    try {
      serviceOutput = await this.usersService.createAccount(createAccountInput);
    } catch (error) {
      serviceOutput = { ok: false, error };
    }
    return serviceOutput;
  }
  // login
  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    let serviceOutput = { ok: false, error: 'login not done', token: '' };
    try {
      serviceOutput = await this.usersService.login(loginInput);
    } catch (error) {
      serviceOutput = { ok: false, error, token: null };
    }
    return serviceOutput;
  }

  @Query((returns) => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @Query((returns) => UserProfileOutput)
  @UseGuards(AuthGuard)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    let serviceOutput = {
      ok: false,
      error: 'userProfile not done',
      user: null,
    };
    try {
      const user = await this.usersService.findById(userProfileInput.userId);
      if (user) {
        serviceOutput.ok = true;
        serviceOutput.error = null;
        serviceOutput.user = user;
      }
    } catch (error) {
      serviceOutput.error = 'user not found by id';
    }
    return serviceOutput;
  }

  @Mutation((returns) => EditProfileOutput)
  @UseGuards(AuthGuard)
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    let serviceOutput = { ok: false, error: 'editProfile not done' };
    try {
      await this.usersService.editProfile(authUser.id, editProfileInput);
      serviceOutput.error = null;
      serviceOutput.ok = true;
    } catch (error) {
      serviceOutput.error = error;
    }
    return serviceOutput;
  }

  @Mutation((returns) => DeleteProfileOutput)
  @UseGuards(AuthGuard)
  async deleteUser(
    @AuthUser() authUser: User,
    @Args('input') deleteProfileInput: DeleteProfileInput,
  ): Promise<DeleteProfileOutput> {
    return this.usersService.deleteProfile(authUser.id, deleteProfileInput);
  }
}
