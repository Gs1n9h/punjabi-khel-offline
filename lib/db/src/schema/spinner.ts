import { pgTable, text, serial, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const spinnerConfigsTable = pgTable("spinner_configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  items: jsonb("items").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  displayMode: text("display_mode").notNull().default("wheel"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const spinRecordsTable = pgTable("spin_records", {
  id: serial("id").primaryKey(),
  configId: integer("config_id").notNull().references(() => spinnerConfigsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  resultLabel: text("result_label").notNull(),
  pointsEarned: integer("points_earned").notNull().default(10),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSpinnerConfigSchema = createInsertSchema(spinnerConfigsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSpinnerConfig = z.infer<typeof insertSpinnerConfigSchema>;
export type SpinnerConfig = typeof spinnerConfigsTable.$inferSelect;

export const insertSpinRecordSchema = createInsertSchema(spinRecordsTable).omit({ id: true, createdAt: true });
export type InsertSpinRecord = z.infer<typeof insertSpinRecordSchema>;
export type SpinRecord = typeof spinRecordsTable.$inferSelect;
