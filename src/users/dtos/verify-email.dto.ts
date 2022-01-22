import { ArgsType, ObjectType, PickType, InputType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Verification } from '../entities/verification.entity';

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}

@ObjectType()
export class VerifyEmailOutput extends CoreOutput {}
