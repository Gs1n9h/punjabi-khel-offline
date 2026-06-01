import { pgTable, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const memoryGameSessionsTable = pgTable("memory_game_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  maxLevel: integer("max_level").notNull(),
  pointsEarned: integer("points_earned").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMemoryGameSessionSchema = createInsertSchema(memoryGameSessionsTable).omit({ id: true, createdAt: true });
export type InsertMemoryGameSession = z.infer<typeof insertMemoryGameSessionSchema>;
export type MemoryGameSession = typeof memoryGameSessionsTable.$inferSelect;
