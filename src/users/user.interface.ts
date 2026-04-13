import { Tokens } from "src/auth/auth.interface";
import { User } from "./user.entity";

export type SafeUser= Omit<User, 'password'>;

export type LoggedUser = SafeUser & Tokens;
