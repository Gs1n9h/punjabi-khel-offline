import { Router } from "express";
import { getAuth, requireAuth } from "@clerk/express";
import { eq, desc } from "drizzle-orm";
import { db, usersTable, tongueTwisterSubmissionsTable } from "@workspace/db";
import { getOrCreateUser } from "./users";

const router = Router();

router.get("/dashboard", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  if (!["admin", "moderator"].includes(user.role)) return res.status(403).json({ error: "Forbidden" });

  const [allUsers, pendingSubmissions, recentSubs] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(tongueTwisterSubmissionsTable).where(eq(tongueTwisterSubmissionsTable.status, "pending")),
    db.select({
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
    .innerJoin(usersTable, eq(tongueTwisterSubmissionsTable.userId, usersTable.id))
    .orderBy(desc(tongueTwisterSubmissionsTable.createdAt))
    .limit(10),
  ]);

  const topPlayers = allUsers.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5).map((u, i) => ({
    rank: i + 1, userId: u.id, username: u.username, displayName: u.displayName,
    avatarUrl: u.avatarUrl, totalPoints: u.totalPoints, gamesPlayed: 0,
  }));

  res.json({
    totalUsers: allUsers.length,
    activeUsers: allUsers.length,
    pendingSubmissions: pendingSubmissions.length,
    totalGamesPlayed: 0,
    recentSubmissions: recentSubs.map(s => ({ ...s, createdAt: s.createdAt.toISOString(), reviewedAt: s.reviewedAt?.toISOString() ?? null })),
    topPlayers,
  });
});

router.get("/users", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  if (!["admin", "moderator"].includes(user.role)) return res.status(403).json({ error: "Forbidden" });
  const { search, role } = req.query;
  let users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  if (role) users = users.filter(u => u.role === role);
  if (search) users = users.filter(u => u.username.includes(search as string) || (u.displayName ?? "").includes(search as string));
  res.json(users);
});

router.patch("/users/:id/role", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  if (user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const targetId = parseInt(req.params.id);
  const { role } = req.body;
  const [updated] = await db.update(usersTable).set({ role }).where(eq(usersTable.id, targetId)).returning();
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

export default router;
