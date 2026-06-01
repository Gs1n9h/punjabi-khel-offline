import { Router } from "express";
import { getAuth, requireAuth } from "@clerk/express";
import { eq, sql } from "drizzle-orm";
import { db, knowledgeQuestionsTable, quizSessionsTable, usersTable } from "@workspace/db";
import { getOrCreateUser } from "./users";

const router = Router();

router.get("/", async (req, res) => {
  const { difficulty } = req.query;
  let questions = await db.select().from(knowledgeQuestionsTable).where(eq(knowledgeQuestionsTable.isActive, true));
  if (difficulty) questions = questions.filter(q => q.difficulty === difficulty);
  res.json(questions.map(q => ({ ...q, options: q.options as string[] })));
});

router.post("/", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  if (!["admin", "moderator"].includes(user.role)) return res.status(403).json({ error: "Forbidden" });
  const { question, imageUrl, options, correctAnswer, explanation, category, difficulty, isActive } = req.body;
  const [created] = await db.insert(knowledgeQuestionsTable).values({ question, imageUrl, options: options ?? [], correctAnswer, explanation, category, difficulty: difficulty ?? "easy", isActive: isActive ?? true }).returning();
  res.status(201).json({ ...created, options: created.options as string[] });
});

router.get("/quiz/random", async (req, res) => {
  const count = parseInt(req.query.count as string) || 5;
  const { difficulty } = req.query;
  let questions = await db.select().from(knowledgeQuestionsTable).where(eq(knowledgeQuestionsTable.isActive, true));
  if (difficulty) questions = questions.filter(q => q.difficulty === difficulty);
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, count);
  res.json(shuffled.map(q => ({ ...q, options: q.options as string[] })));
});

router.post("/submit", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  const { answers } = req.body as { answers: Array<{ questionId: number; selectedAnswer: string }> };
  const questionIds = answers.map(a => a.questionId);
  const questions = await db.select().from(knowledgeQuestionsTable).where(sql`${knowledgeQuestionsTable.id} = ANY(${questionIds})`);
  const breakdown = answers.map(a => {
    const q = questions.find(q => q.id === a.questionId);
    return { questionId: a.questionId, correct: q?.correctAnswer === a.selectedAnswer, selectedAnswer: a.selectedAnswer, correctAnswer: q?.correctAnswer ?? "" };
  });
  const correctAnswers = breakdown.filter(b => b.correct).length;
  const totalQuestions = answers.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const pointsEarned = correctAnswers * 15;
  await db.insert(quizSessionsTable).values({ userId: user.id, totalQuestions, correctAnswers, score, pointsEarned });
  await db.update(usersTable).set({ totalPoints: user.totalPoints + pointsEarned }).where(eq(usersTable.id, user.id));
  res.json({ score, totalQuestions, correctAnswers, pointsEarned, breakdown });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [q] = await db.select().from(knowledgeQuestionsTable).where(eq(knowledgeQuestionsTable.id, id)).limit(1);
  if (!q) return res.status(404).json({ error: "Not found" });
  res.json({ ...q, options: q.options as string[] });
});

router.patch("/:id", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  if (!["admin", "moderator"].includes(user.role)) return res.status(403).json({ error: "Forbidden" });
  const id = parseInt(req.params.id);
  const { question, imageUrl, options, correctAnswer, explanation, category, difficulty, isActive } = req.body;
  const [updated] = await db.update(knowledgeQuestionsTable)
    .set({ ...(question && { question }), ...(imageUrl !== undefined && { imageUrl }), ...(options !== undefined && { options }), ...(correctAnswer && { correctAnswer }), ...(explanation !== undefined && { explanation }), ...(category !== undefined && { category }), ...(difficulty && { difficulty }), ...(isActive !== undefined && { isActive }) })
    .where(eq(knowledgeQuestionsTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json({ ...updated, options: updated.options as string[] });
});

router.delete("/:id", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  if (!["admin", "moderator"].includes(user.role)) return res.status(403).json({ error: "Forbidden" });
  await db.delete(knowledgeQuestionsTable).where(eq(knowledgeQuestionsTable.id, parseInt(req.params.id)));
  res.status(204).end();
});

export default router;
