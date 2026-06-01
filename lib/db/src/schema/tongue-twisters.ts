import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const tongueTwistersTable = pgTable("tongue_twisters", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  transliteration: text("transliteration"),
  translation: text("translation"),
  difficulty: text("difficulty").notNull().default("easy"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const tongueTwisterSubmissionsTable = pgTable("tongue_twister_submissions", {
  id: serial("id").primaryKey(),
  tongueTwisterId: integer("tongue_twister_id").notNull().references(() => tongueTwistersTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  audioUrl: text("audio_url").notNull(),
  durationSeconds: text("duration_seconds"),
  status: text("status").notNull().default("pending"),
  score: integer("score"),
  feedback: text("feedback"),
  pointsEarned: integer("points_earned"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const insertTongueTwisterSchema = createInsertSchema(tongueTwistersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTongueTwister = z.infer<typeof insertTongueTwisterSchema>;
export type TongueTwister = typeof tongueTwistersTable.$inferSelect;

export const insertTongueTwisterSubmissionSchema = createInsertSchema(tongueTwisterSubmissionsTable).omit({ id: true, createdAt: true });
export type InsertTongueTwisterSubmission = z.infer<typeof insertTongueTwisterSubmissionSchema>;
export type TongueTwisterSubmission = typeof tongueTwisterSubmissionsTable.$inferSelect;
