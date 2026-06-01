import { Router } from "express";
import { getAuth, requireAuth } from "@clerk/express";
import { desc, eq, max, count, sql } from "drizzle-orm";
import { db, memoryGameSessionsTable, usersTable } from "@workspace/db";
import { getOrCreateUser } from "./users";

const router = Router();

router.post("/submit", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);

  const { maxLevel, pointsEarned } = req.body as { maxLevel: number; pointsEarned: number };

  const [session] = await db
    .insert(memoryGameSessionsTable)
    .values({ userId: user.id, maxLevel, pointsEarned })
    .returning();

  await db
    .update(usersTable)
    .set({ totalPoints: user.totalPoints + pointsEarned })
    .where(eq(usersTable.id, user.id));

  res.json({
    id: session.id,
    userId: session.userId,
    maxLevel: session.maxLevel,
    pointsEarned: session.pointsEarned,
    createdAt: session.createdAt.toISOString(),
  });
});

router.get("/leaderboard", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;

  const rows = await db
    .select({
      userId: memoryGameSessionsTable.userId,
      bestLevel: max(memoryGameSessionsTable.maxLevel),
      gamesPlayed: count(memoryGameSessionsTable.id),
      username: usersTable.username,
      displayName: usersTable.displayName,
      avatarUrl: usersTable.avatarUrl,
    })
    .from(memoryGameSessionsTable)
    .innerJoin(usersTable, eq(memoryGameSessionsTable.userId, usersTable.id))
    .groupBy(
      memoryGameSessionsTable.userId,
      usersTable.username,
      usersTable.displayName,
      usersTable.avatarUrl,
    )
    .orderBy(desc(sql`max(${memoryGameSessionsTable.maxLevel})`))
    .limit(limit);

  const entries = rows.map((r, i) => ({
    rank: i + 1,
    userId: r.userId,
    username: r.username,
    displayName: r.displayName,
    avatarUrl: r.avatarUrl,
    bestLevel: r.bestLevel ?? 0,
    gamesPlayed: Number(r.gamesPlayed),
  }));

  res.json(entries);
});

export default router;
