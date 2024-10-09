import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { commitments, participants, users } from "~~/services/database/config/schema";

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

export async function updateUser(userId: Required<UserUpdate>["id"], user: UserUpdate) {
  return await db.update(users).set(user).where(eq(users.id, userId));
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
      participations: {
        with: {
          commitment: true,
        },
      },
      createdCommitments: true,
    },
  });
}

export async function getUserCommitments(userId: number) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      createdCommitments: true,
      participations: {
        with: {
          commitment: true,
        },
      },
    },
  });
}

export async function createCommitment(commitment: InferInsertModel<typeof commitments>) {
  return await db.insert(commitments).values(commitment).returning();
}

export async function joinCommitment(userId: number, commitmentId: number) {
  const participation = {
    userId,
    commitmentId,
    joinedAt: new Date(),
    hasCompleted: false,
  };
  return await db.insert(participants).values(participation).returning();
}

export async function getCommitmentParticipants(commitmentId: number) {
  return await db.query.commitments.findFirst({
    where: eq(commitments.id, commitmentId),
    with: {
      participants: {
        with: {
          user: true,
        },
      },
    },
  });
}
