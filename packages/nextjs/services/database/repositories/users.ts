import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { proofs, users } from "~~/services/database/config/schema";

export type UserInsert = InferInsertModel<typeof users>;
export type UserUpdate = Partial<UserInsert>;
export type User = InferSelectModel<typeof users>;

export async function createUser(user: UserInsert) {
  return await db.insert(users).values(user).returning({
    id: users.id,
    address: users.address,
    createdAt: users.createdAt,
  });
}

export async function findJustUserByAddress(address: string) {
  return await db.query.users.findFirst({
    where: eq(users.address, address),
  });
}

export async function findUserByAddress(address: string) {
  return await db.query.users.findFirst({
    where: eq(users.address, address),
    with: {
      proofs: true,
    },
  });
}

export type ProofInsert = InferInsertModel<typeof proofs>;

export async function createProof(proof: ProofInsert) {
  return await db.insert(proofs).values(proof).returning();
}

export async function findProofsByCommitmentId(commitmentId: number) {
  return await db.query.proofs.findMany({
    where: eq(proofs.commitmentId, commitmentId),
    with: {
      user: true,
    },
  });
}
