import { Router } from "express";
import { getAuth, requireAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, spinnerConfigsTable, spinRecordsTable, usersTable } from "@workspace/db";
import { getOrCreateUser } from "./users";

const router = Router();

router.get("/configs", async (req, res) => {
  const configs = await db.select().from(spinnerConfigsTable).orderBy(spinnerConfigsTable.createdAt);
  res.json(configs.map(c => ({ ...c, items: c.items as unknown[] })));
});

router.post("/configs", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  if (!["admin", "moderator"].includes(user.role)) return res.status(403).json({ error: "Forbidden" });
  const { name, description, items, isActive, displayMode } = req.body;
  const [created] = await db.insert(spinnerConfigsTable).values({ name, description, items: items ?? [], isActive: isActive ?? true, displayMode: displayMode ?? "wheel" }).returning();
  res.status(201).json({ ...created, items: created.items as unknown[] });
});

router.get("/configs/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [config] = await db.select().from(spinnerConfigsTable).where(eq(spinnerConfigsTable.id, id)).limit(1);
  if (!config) return res.status(404).json({ error: "Not found" });
  res.json({ ...config, items: config.items as unknown[] });
});

router.patch("/configs/:id", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  if (!["admin", "moderator"].includes(user.role)) return res.status(403).json({ error: "Forbidden" });
  const id = parseInt(req.params.id);
  const { name, description, items, isActive, displayMode } = req.body;
  const [updated] = await db.update(spinnerConfigsTable)
    .set({ ...(name && { name }), ...(description !== undefined && { description }), ...(items !== undefined && { items }), ...(isActive !== undefined && { isActive }), ...(displayMode !== undefined && { displayMode }) })
    .where(eq(spinnerConfigsTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json({ ...updated, items: updated.items as unknown[] });
});

router.delete("/configs/:id", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  if (!["admin", "moderator"].includes(user.role)) return res.status(403).json({ error: "Forbidden" });
  const id = parseInt(req.params.id);
  await db.delete(spinnerConfigsTable).where(eq(spinnerConfigsTable.id, id));
  res.status(204).end();
});

router.post("/spin", requireAuth(), async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await getOrCreateUser(clerkId);
  const { configId, resultLabel } = req.body;
  const pointsEarned = 10;
  const [record] = await db.insert(spinRecordsTable).values({ configId, userId: user.id, resultLabel, pointsEarned }).returning();
  await db.update(usersTable).set({ totalPoints: user.totalPoints + pointsEarned }).where(eq(usersTable.id, user.id));
  res.json({ id: record.id, configId: record.configId, resultLabel: record.resultLabel, pointsEarned: record.pointsEarned, createdAt: record.createdAt });
});

export default router;
