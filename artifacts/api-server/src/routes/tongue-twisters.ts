import { Router } from "express";
import { getAuth, requireAuth } from "@clerk/express";
import { eq, and } from "drizzle-orm";
import { db, tongueTwistersTable, tongueTwisterSubmissionsTable, usersTable } from "@workspace/db";
import { getOrCreateUser } from "./users";

const router = Router();

router.get("/", async (req, res) => {
  const twisters = await db.select().from(tongueTwistersTable).orderBy(tongueTwistersTable.createdAt);
  res.json(twisters);
});

router.post("/", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  if (!["admin", "moderator"].includes(user.role)) return res.status(403).json({ error: "Forbidden" });
  const { text, transliteration, translation, difficulty, isActive } = req.body;
  const [created] = await db.insert(tongueTwistersTable).values({ text, transliteration, translation, difficulty: difficulty ?? "easy", isActive: isActive ?? true }).returning();
  res.status(201).json(created);
});

router.get("/submissions", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  const { status, userId: filterUserId } = req.query;

  let query = db
    .select({
      id: tongueTwisterSubmissionsTable.id,
      tongueTwisterId: tongueTwisterSubmissionsTable.tongueTwisterId,
      userId: tongueTwisterSubmissionsTable.userId,
      username: usersTable.username,
      audioUrl: tongueTwisterSubmissionsTable.audioUrl,
      status: tongueTwisterSubmissionsTable.status,
      score: tongueTwisterSubmissionsTable.score,
      feedback: tongueTwisterSubmissionsTable.feedback,
      pointsEarned: tongueTwisterSubmissionsTable.pointsEarned,
      createdAt: tongueTwisterSubmissionsTable.createdAt,
      reviewedAt: tongueTwisterSubmissionsTable.reviewedAt,
    })
    .from(tongueTwisterSubmissionsTable)
    .innerJoin(usersTable, eq(tongueTwisterSubmissionsTable.userId, usersTable.id));

  const conditions = [];
  if (!["admin", "moderator"].includes(user.role)) {
    conditions.push(eq(tongueTwisterSubmissionsTable.userId, user.id));
  } else if (filterUserId) {
    conditions.push(eq(tongueTwisterSubmissionsTable.userId, parseInt(filterUserId as string)));
  }
  if (status) {
    conditions.push(eq(tongueTwisterSubmissionsTable.status, status as string));
  }

  const results = conditions.length > 0
    ? await query.where(conditions.length === 1 ? conditions[0] : and(...conditions))
    : await query;

  res.json(results.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), reviewedAt: r.reviewedAt?.toISOString() ?? null })));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [twister] = await db.select().from(tongueTwistersTable).where(eq(tongueTwistersTable.id, id)).limit(1);
  if (!twister) return res.status(404).json({ error: "Not found" });
  res.json(twister);
});

router.patch("/:id", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  if (!["admin", "moderator"].includes(user.role)) return res.status(403).json({ error: "Forbidden" });
  const id = parseInt(req.params.id);
  const { text, transliteration, translation, difficulty, isActive } = req.body;
  const [updated] = await db.update(tongueTwistersTable)
    .set({ ...(text && { text }), ...(transliteration !== undefined && { transliteration }), ...(translation !== undefined && { translation }), ...(difficulty && { difficulty }), ...(isActive !== undefined && { isActive }) })
    .where(eq(tongueTwistersTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

router.delete("/:id", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  if (!["admin", "moderator"].includes(user.role)) return res.status(403).json({ error: "Forbidden" });
  await db.delete(tongueTwistersTable).where(eq(tongueTwistersTable.id, parseInt(req.params.id)));
  res.status(204).end();
});

router.post("/:id/submit", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  const tongueTwisterId = parseInt(req.params.id);
  const { audioUrl, durationSeconds } = req.body;
  const [submission] = await db.insert(tongueTwisterSubmissionsTable)
    .values({ tongueTwisterId, userId: user.id, audioUrl, durationSeconds: durationSeconds?.toString(), status: "pending" })
    .returning();
  const [twister] = await db.select().from(tongueTwistersTable).where(eq(tongueTwistersTable.id, tongueTwisterId)).limit(1);
  res.status(201).json({
    ...submission,
    username: user.username,
    createdAt: submission.createdAt.toISOString(),
    reviewedAt: null,
  });
});

router.patch("/submissions/:id/review", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  if (!["admin", "moderator"].includes(user.role)) return res.status(403).json({ error: "Forbidden" });
  const id = parseInt(req.params.id);
  const { status, score, feedback } = req.body;
  const pointsEarned = status === "approved" ? Math.round(score / 10) * 5 : 0;
  const [updated] = await db.update(tongueTwisterSubmissionsTable)
    .set({ status, score, feedback, pointsEarned, reviewedAt: new Date() })
    .where(eq(tongueTwisterSubmissionsTable.id, id))
    .returning();
  if (!updated) return res.status(404).json({ error: "Not found" });
  if (status === "approved" && pointsEarned > 0) {
    const [subUser] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId)).limit(1);
    if (subUser) await db.update(usersTable).set({ totalPoints: subUser.totalPoints + pointsEarned }).where(eq(usersTable.id, subUser.id));
  }
  const [submissionUser] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId)).limit(1);
  res.json({ ...updated, username: submissionUser?.username ?? "", createdAt: updated.createdAt.toISOString(), reviewedAt: updated.reviewedAt?.toISOString() ?? null });
});

export default router;
