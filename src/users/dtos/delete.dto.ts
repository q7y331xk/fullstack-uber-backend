import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteProfileInput {
  @Field((type) => String)
  password: string;
}

@ObjectType()
export class DeleteProfileOutput extends CoreOutput {}
