import { cookies } from "next/headers";
import { AuthOptions, JWT, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import { createUser, findJustUserByAddress } from "~~/services/database/repositories/users";

export const providers = [
  CredentialsProvider({
    name: "Ethereum",
    credentials: {
      message: {
        label: "Message",
        type: "text",
        placeholder: "0x0",
      },
      signature: {
        label: "Signature",
        type: "text",
        placeholder: "0x0",
      },
    },
    async authorize(credentials) {
      try {
        const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"));
        const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);
        const result = await siwe.verify({
          signature: credentials?.signature || "",
          domain: nextAuthUrl.host,
          nonce: await getCsrfToken({
            req: {
              headers: {
                cookie: cookies().toString(),
              },
            },
          }),
        });

        if (result.success) {
          let user = await findJustUserByAddress(siwe.address);
          if (!user) {
            // Create a new user if they don't exist
            user = (await createUser({ address: siwe.address }))[0];
          }
          return { id: user?.id.toString(), address: user?.address };
        }
        return null;
      } catch (e) {
        return null;
      }
    },
  }),
];

export const authOptions: AuthOptions = {
  providers,
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.address = user.address;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = {
        address: token.address as string,
      };
      return session;
    },
  },
} as const;
