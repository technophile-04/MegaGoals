import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// User table and relations
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 42 }).unique().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  participations: many(participants),
  createdCommitments: many(commitments),
}));

// Commitments table and relations
export const commitments = pgTable("commitments", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  description: text("description").notNull(),
  stakeAmount: integer("stake_amount").notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  isGroupCommitment: boolean("is_group_commitment").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  proofFrequency: text("proof_frequency").notNull(), // e.g., 'daily', 'weekly'
});

export const commitmentsRelations = relations(commitments, ({ many, one }) => ({
  participants: many(participants),
  proofs: many(proofs),
  creator: one(users, {
    fields: [commitments.creatorId],
    references: [users.id],
  }),
}));

// Participants table and relations
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  commitmentId: integer("commitment_id")
    .notNull()
    .references(() => commitments.id),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  hasCompleted: boolean("has_completed").notNull().default(false),
});

export const participantsRelations = relations(participants, ({ one, many }) => ({
  user: one(users, {
    fields: [participants.userId],
    references: [users.id],
  }),
  commitment: one(commitments, {
    fields: [participants.commitmentId],
    references: [commitments.id],
  }),
  proofs: many(proofs),
}));

// Proofs table and relations
export const proofs = pgTable("proofs", {
  id: serial("id").primaryKey(),
  commitmentId: integer("commitment_id")
    .notNull()
    .references(() => commitments.id),
  participantId: integer("participant_id")
    .notNull()
    .references(() => participants.id),
  proofUrl: text("proof_url").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  isVerified: boolean("is_verified").notNull().default(false),
});

export const proofsRelations = relations(proofs, ({ one, many }) => ({
  commitment: one(commitments, {
    fields: [proofs.commitmentId],
    references: [commitments.id],
  }),
  participant: one(participants, {
    fields: [proofs.participantId],
    references: [participants.id],
  }),
  verifications: many(verifications),
}));

// Verifications table and relations
export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  proofId: integer("proof_id")
    .notNull()
    .references(() => proofs.id),
  verifierId: integer("verifier_id")
    .notNull()
    .references(() => participants.id),
  verifiedAt: timestamp("verified_at").notNull().defaultNow(),
  isApproved: boolean("is_approved").notNull(),
});

export const verificationsRelations = relations(verifications, ({ one }) => ({
  proof: one(proofs, {
    fields: [verifications.proofId],
    references: [proofs.id],
  }),
  verifier: one(participants, {
    fields: [verifications.verifierId],
    references: [participants.id],
  }),
}));
