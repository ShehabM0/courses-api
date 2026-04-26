import { UserRole } from "src/users/user.entity";
import { SetMetadata } from "@nestjs/common";

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
