import "next-auth";
import { DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  export interface Session {
    user: {
      address?: string | null;
    };
    expires: ISODateString;
  }

  export interface User extends DefaultUser {
    address?: string | null;
  }

  export interface JWT extends DefaultJWT {
    address?: string | null;
  }
}
