import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const knowledgeQuestionsTable = pgTable("knowledge_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  imageUrl: text("image_url"),
  options: jsonb("options").notNull().default([]),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  category: text("category"),
  difficulty: text("difficulty").notNull().default("easy"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const quizSessionsTable = pgTable("quiz_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  score: integer("score").notNull(),
  pointsEarned: integer("points_earned").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertKnowledgeQuestionSchema = createInsertSchema(knowledgeQuestionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertKnowledgeQuestion = z.infer<typeof insertKnowledgeQuestionSchema>;
export type KnowledgeQuestion = typeof knowledgeQuestionsTable.$inferSelect;

export const insertQuizSessionSchema = createInsertSchema(quizSessionsTable).omit({ id: true, createdAt: true });
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type QuizSession = typeof quizSessionsTable.$inferSelect;
