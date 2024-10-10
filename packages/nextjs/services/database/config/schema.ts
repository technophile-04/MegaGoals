import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 42 }).unique().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  proofs: many(proofs),
}));

// Proofs table
export const proofs = pgTable("proofs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  commitmentId: integer("commitment_id").notNull(),
  proofUrl: text("proof_url").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const proofsRelations = relations(proofs, ({ one }) => ({
  user: one(users, {
    fields: [proofs.userId],
    references: [users.id],
  }),
}));
