import { Router } from "express";
import { getAuth, requireAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, usersTable, spinRecordsTable, tongueTwisterSubmissionsTable, quizSessionsTable } from "@workspace/db";

const router = Router();

async function getOrCreateUser(clerkId: string, email?: string) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (existing.length > 0) return existing[0];
  const username = email ? email.split("@")[0] : `user_${clerkId.slice(-6)}`;
  const [created] = await db.insert(usersTable).values({ clerkId, username }).returning();
  return created;
}

router.get("/me", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  res.json({
    id: user.id,
    clerkId: user.clerkId,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    totalPoints: user.totalPoints,
    createdAt: user.createdAt,
  });
});

router.patch("/me", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  const { username, displayName, avatarUrl } = req.body;
  const [updated] = await db
    .update(usersTable)
    .set({ ...(username && { username }), ...(displayName !== undefined && { displayName }), ...(avatarUrl !== undefined && { avatarUrl }) })
    .where(eq(usersTable.id, user.id))
    .returning();
  res.json({ ...updated });
});

router.get("/me/stats", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);

  const [spins, submissions, quizzes] = await Promise.all([
    db.select().from(spinRecordsTable).where(eq(spinRecordsTable.userId, user.id)),
    db.select().from(tongueTwisterSubmissionsTable).where(eq(tongueTwisterSubmissionsTable.userId, user.id)),
    db.select().from(quizSessionsTable).where(eq(quizSessionsTable.userId, user.id)),
  ]);

  const allUsers = await db.select({ id: usersTable.id, totalPoints: usersTable.totalPoints }).from(usersTable).orderBy(usersTable.totalPoints);
  const rank = allUsers.filter(u => u.totalPoints > user.totalPoints).length + 1;

  const recentActivity = [
    ...spins.slice(-5).map(s => ({ type: "spin" as const, points: s.pointsEarned, description: `Spun: ${s.resultLabel}`, createdAt: s.createdAt.toISOString() })),
    ...submissions.slice(-5).map(s => ({ type: "tongue-twister" as const, points: s.pointsEarned ?? 0, description: "Tongue twister submitted", createdAt: s.createdAt.toISOString() })),
    ...quizzes.slice(-5).map(q => ({ type: "quiz" as const, points: q.pointsEarned, description: `Quiz: ${q.correctAnswers}/${q.totalQuestions} correct`, createdAt: q.createdAt.toISOString() })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  res.json({
    totalPoints: user.totalPoints,
    spinsPlayed: spins.length,
    tongueTwisterSubmissions: submissions.length,
    quizzesCompleted: quizzes.length,
    rank,
    recentActivity,
  });
});

export { getOrCreateUser };
export default router;
