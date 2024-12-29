import { Reflector } from '@nestjs/core';

import { UserRole } from '../references/user-role.reference';

export const Roles = Reflector.createDecorator<UserRole[]>();
