import { Router } from "express";
import { getAuth, requireAuth } from "@clerk/express";
import { desc } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { getOrCreateUser } from "./users";

const router = Router();

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.totalPoints)).limit(limit);
  const entries = users.map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    totalPoints: u.totalPoints,
    gamesPlayed: 0,
  }));
  res.json(entries);
});

router.get("/me", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  const allUsers = await db.select().from(usersTable).orderBy(desc(usersTable.totalPoints));
  const myRankIndex = allUsers.findIndex(u => u.id === user.id);
  const rank = myRankIndex + 1;
  const start = Math.max(0, myRankIndex - 2);
  const end = Math.min(allUsers.length, myRankIndex + 3);
  const nearbyPlayers = allUsers.slice(start, end).map((u, i) => ({
    rank: start + i + 1,
    userId: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    totalPoints: u.totalPoints,
    gamesPlayed: 0,
  }));
  res.json({ rank, totalPoints: user.totalPoints, nearbyPlayers });
});

export default router;
