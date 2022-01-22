import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    let ret = false;
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const { user } = gqlContext;
    if (user) {
      ret = true;
    }
    return ret;
  }
}
